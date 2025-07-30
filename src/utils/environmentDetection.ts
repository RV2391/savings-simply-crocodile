export const isEmbedded = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin restrictions,
    // we're likely in an iframe
    return true;
  }
};

export const getGTMContainerId = (): string | null => {
  if (isEmbedded()) {
    // Return null to disable GTM in embedded mode
    // or return a different container ID if you want separate tracking
    return null;
  }
  return 'GTM-MNZBQL6';
};

export const getTrackingSource = (): 'standalone' | 'embed' => {
  return isEmbedded() ? 'embed' : 'standalone';
};