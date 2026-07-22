from datetime import date

from pydantic import BaseModel, Field


class HistoryPoint(BaseModel):
    date: date
    quantity: int = Field(ge=0)
    revenue: float = Field(ge=0)


class ProductInput(BaseModel):
    sku: str
    category: str | None = None
    price: float = Field(ge=0)
    history: list[HistoryPoint]


class ForecastRequest(BaseModel):
    products: list[ProductInput]
    horizon_days: int = Field(alias="horizonDays", ge=1, le=90)


class PredictionPoint(BaseModel):
    date: str
    predicted_quantity: float = Field(serialization_alias="predictedQuantity")
    predicted_revenue: float = Field(serialization_alias="predictedRevenue")
    lower_bound: float = Field(serialization_alias="lowerBound")
    upper_bound: float = Field(serialization_alias="upperBound")


class SkippedProduct(BaseModel):
    sku: str
    reason: str


class SearchProductInput(BaseModel):
    sku: str
    name: str
    category: str | None = None


class SearchRequest(BaseModel):
    products: list[SearchProductInput]
    query: str
