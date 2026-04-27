const corsProxy = 'https://corsproxy.io/?';

export const getProxyImageUrl = (url) => {
  if (!url) return null;
  if (url.includes('unsplash.com') || url.includes('placeholder.com')) {
    return url;
  }
  return corsProxy + encodeURIComponent(url);
};