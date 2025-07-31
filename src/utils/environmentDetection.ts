export const isEmbedded = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin restrictions,
    // we're likely in an iframe
    return true;
  }
};

export const getGTMContainerId = (): string => {
  if (isEmbedded()) {
    // Use separate GTM container for embedded lead-gen tools
    return 'GTM-TJNNMFVQ';
  }
  return 'GTM-MNZBQL6';
};

export const getTrackingSource = (): 'standalone' | 'embed' => {
  return isEmbedded() ? 'embed' : 'standalone';
};