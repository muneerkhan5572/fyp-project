from __future__ import annotations

import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

MIN_PRODUCTS_FOR_CLUSTERING = 6
N_CLUSTERS = 3
RANDOM_STATE = 42

_TIER_LABELS = ["slow-mover", "normal", "high-demand"]


def classify_products(products: list[dict]) -> list[dict]:
    if len(products) < MIN_PRODUCTS_FOR_CLUSTERING:
        return []

    features = np.array(
        [[product["units_velocity"], product["revenue_velocity"]] for product in products]
    )
    scaled = StandardScaler().fit_transform(features)

    kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=RANDOM_STATE, n_init=10)
    cluster_ids = kmeans.fit_predict(scaled)

    cluster_mean_units_velocity = {
        cluster_id: features[cluster_ids == cluster_id, 0].mean()
        for cluster_id in range(N_CLUSTERS)
    }
    ordered_clusters = sorted(
        cluster_mean_units_velocity, key=lambda cluster_id: cluster_mean_units_velocity[cluster_id]
    )
    label_by_cluster = {
        cluster_id: _TIER_LABELS[rank] for rank, cluster_id in enumerate(ordered_clusters)
    }

    return [
        {"sku": product["sku"], "classification": label_by_cluster[cluster_id]}
        for product, cluster_id in zip(products, cluster_ids)
    ]
