export const DATASETS_HREF = "/dashboard?all=1";

export function datasetHref(datasetId: string) {
  return `/dashboard/${datasetId}/import`;
}

export function datasetSectionHref(datasetId: string, section: string) {
  return `/dashboard/${datasetId}/${section}`;
}
