import { SiteAsset } from '@/hooks/useSiteAsset';

export const getAssetUrl = (asset: SiteAsset | null | undefined): string | null => {
  if (!asset?.file_url) return null;
  return `${asset.file_url}?v=${asset.id}`;
};
