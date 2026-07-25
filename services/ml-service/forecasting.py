from __future__ import annotations

from datetime import date, timedelta

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

from schemas import ForecastRequest, ProductInput

MIN_HISTORY_DAYS = 28
TEST_DAYS = 14
LOWER_PERCENTILE = 10
UPPER_PERCENTILE = 90
RANDOM_STATE = 42

BASE_FEATURE_COLUMNS = [
    "day_of_week",
    "week_of_year",
    "rolling_mean_7",
    "rolling_mean_30",
    "lag_7",
    "lag_14",
    "price",
]


def _gap_fill_product(product: ProductInput) -> pd.DataFrame:
    history = sorted(product.history, key=lambda point: point.date)
    frame = pd.DataFrame(
        {
            "date": [point.date for point in history],
            "quantity": [point.quantity for point in history],
            "revenue": [point.revenue for point in history],
        }
    )
    frame = frame.set_index("date")
    full_range = pd.date_range(frame.index.min(), frame.index.max(), freq="D").date
    frame = frame.reindex(full_range, fill_value=0)
    frame.index.name = "date"
    frame["sku"] = product.sku
    frame["category"] = product.category or "Uncategorized"
    frame["price"] = product.price
    return frame.reset_index()


def _add_causal_features(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.sort_values("date").reset_index(drop=True)
    quantity = frame["quantity"]
    frame["day_of_week"] = pd.to_datetime(frame["date"]).dt.dayofweek
    frame["week_of_year"] = pd.to_datetime(frame["date"]).dt.isocalendar().week.astype(int)
    frame["rolling_mean_7"] = quantity.shift(1).rolling(7, min_periods=1).mean().fillna(0)
    frame["rolling_mean_30"] = quantity.shift(1).rolling(30, min_periods=1).mean().fillna(0)
    frame["lag_7"] = quantity.shift(7).fillna(0)
    frame["lag_14"] = quantity.shift(14).fillna(0)
    return frame


def _build_training_frame(products: list[ProductInput]) -> tuple[pd.DataFrame, list[dict]]:
    included_frames = []
    skipped = []
    for product in products:
        if not product.history:
            skipped.append({"sku": product.sku, "reason": "No sales history provided."})
            continue
        gap_filled = _gap_fill_product(product)
        if len(gap_filled) < MIN_HISTORY_DAYS:
            skipped.append(
                {
                    "sku": product.sku,
                    "reason": f"Needs at least {MIN_HISTORY_DAYS} days of history, has {len(gap_filled)}.",
                }
            )
            continue
        included_frames.append(_add_causal_features(gap_filled))

    if not included_frames:
        return pd.DataFrame(), skipped

    combined = pd.concat(included_frames, ignore_index=True)
    category_dummies = pd.get_dummies(combined["category"], prefix="category")
    combined = pd.concat([combined, category_dummies], axis=1)
    return combined, skipped


def _feature_columns(frame: pd.DataFrame) -> list[str]:
    category_columns = [column for column in frame.columns if column.startswith("category_")]
    return BASE_FEATURE_COLUMNS + category_columns


def _split_train_test(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    train_parts = []
    test_parts = []
    for _sku, group in frame.groupby("sku"):
        group = group.sort_values("date")
        if len(group) <= TEST_DAYS:
            train_parts.append(group)
            continue
        train_parts.append(group.iloc[:-TEST_DAYS])
        test_parts.append(group.iloc[-TEST_DAYS:])
    train = pd.concat(train_parts, ignore_index=True) if train_parts else frame.iloc[0:0]
    test = pd.concat(test_parts, ignore_index=True) if test_parts else frame.iloc[0:0]
    return train, test


def _evaluate(frame: pd.DataFrame, feature_columns: list[str]) -> dict:
    train, test = _split_train_test(frame)
    if train.empty or test.empty:
        return {
            "randomForest": {"rmse": None, "mae": None},
            "linearRegression": {"rmse": None, "mae": None},
        }

    x_train = train[feature_columns].values
    y_train = train["quantity"].values
    x_test = test[feature_columns].values
    y_test = test["quantity"].values

    rf = RandomForestRegressor(n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1)
    rf.fit(x_train, y_train)
    rf_predictions = np.clip(rf.predict(x_test), a_min=0, a_max=None)

    lr = LinearRegression()
    lr.fit(x_train, y_train)
    lr_predictions = np.clip(lr.predict(x_test), a_min=0, a_max=None)

    return {
        "randomForest": {
            "rmse": float(np.sqrt(mean_squared_error(y_test, rf_predictions))),
            "mae": float(mean_absolute_error(y_test, rf_predictions)),
        },
        "linearRegression": {
            "rmse": float(np.sqrt(mean_squared_error(y_test, lr_predictions))),
            "mae": float(mean_absolute_error(y_test, lr_predictions)),
        },
    }


def _train_final_model(frame: pd.DataFrame, feature_columns: list[str]) -> RandomForestRegressor:
    model = RandomForestRegressor(n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1)
    model.fit(frame[feature_columns].values, frame["quantity"].values)
    return model


def _predict_with_bounds(model: RandomForestRegressor, row: pd.DataFrame) -> tuple[float, float, float]:
    row_values = row.values
    mean_prediction = float(np.clip(model.predict(row_values)[0], 0, None))
    tree_predictions = np.array([tree.predict(row_values)[0] for tree in model.estimators_])
    lower = float(np.clip(np.percentile(tree_predictions, LOWER_PERCENTILE), 0, None))
    upper = float(np.clip(np.percentile(tree_predictions, UPPER_PERCENTILE), 0, None))
    return mean_prediction, min(lower, mean_prediction), max(upper, mean_prediction)


def _forecast_product(
    model: RandomForestRegressor,
    product: ProductInput,
    feature_columns: list[str],
    category_columns: list[str],
    horizon_days: int,
) -> list[dict]:
    gap_filled = _add_causal_features(_gap_fill_product(product))
    working_dates = list(gap_filled["date"])
    working_quantities = list(gap_filled["quantity"])
    category_column = f"category_{product.category or 'Uncategorized'}"

    predictions = []
    last_date = working_dates[-1]

    for step in range(1, horizon_days + 1):
        target_date = last_date + timedelta(days=step)
        quantity_series = pd.Series(working_quantities)
        rolling_7 = quantity_series.tail(7).mean() if len(quantity_series) >= 1 else 0.0
        rolling_30 = quantity_series.tail(30).mean() if len(quantity_series) >= 1 else 0.0
        lag_7 = working_quantities[-7] if len(working_quantities) >= 7 else 0.0
        lag_14 = working_quantities[-14] if len(working_quantities) >= 14 else 0.0

        row = {column: 0.0 for column in feature_columns}
        row["day_of_week"] = target_date.weekday()
        row["week_of_year"] = target_date.isocalendar().week
        row["rolling_mean_7"] = rolling_7
        row["rolling_mean_30"] = rolling_30
        row["lag_7"] = lag_7
        row["lag_14"] = lag_14
        row["price"] = product.price
        if category_column in row:
            row[category_column] = 1.0

        row_frame = pd.DataFrame([row], columns=feature_columns)
        predicted_quantity, lower_bound, upper_bound = _predict_with_bounds(model, row_frame)
        rounded_quantity = round(predicted_quantity, 2)

        predictions.append(
            {
                "date": target_date.isoformat(),
                "predictedQuantity": rounded_quantity,
                "predictedRevenue": round(rounded_quantity * product.price, 2),
                "lowerBound": round(lower_bound, 2),
                "upperBound": round(upper_bound, 2),
            }
        )

        working_dates.append(target_date)
        working_quantities.append(predicted_quantity)

    return predictions


def generate_forecasts(payload: ForecastRequest) -> dict:
    training_frame, skipped = _build_training_frame(payload.products)

    if training_frame.empty:
        return {
            "modelType": "random_forest",
            "generatedAt": pd.Timestamp.utcnow().isoformat(),
            "horizonDays": payload.horizon_days,
            "predictions": {},
            "metrics": {
                "randomForest": {"rmse": None, "mae": None},
                "linearRegression": {"rmse": None, "mae": None},
            },
            "skipped": skipped,
        }

    feature_columns = _feature_columns(training_frame)
    category_columns = [column for column in feature_columns if column.startswith("category_")]

    metrics = _evaluate(training_frame, feature_columns)
    final_model = _train_final_model(training_frame, feature_columns)

    included_skus = set(training_frame["sku"].unique())
    predictions: dict[str, list[dict]] = {}
    for product in payload.products:
        if product.sku not in included_skus:
            continue
        predictions[product.sku] = _forecast_product(
            final_model, product, feature_columns, category_columns, payload.horizon_days
        )

    return {
        "modelType": "random_forest",
        "generatedAt": pd.Timestamp.utcnow().isoformat(),
        "horizonDays": payload.horizon_days,
        "predictions": predictions,
        "metrics": metrics,
        "skipped": skipped,
    }
