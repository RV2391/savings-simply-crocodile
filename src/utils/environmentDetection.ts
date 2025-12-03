export const isEmbedded = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin restrictions,
    // we're likely in an iframe
    return true;
  }
};

// KursRadar GTM Web Container (Server-side tracking via Taggrs)
export const getGTMContainerId = (): string => {
  return 'GTM-KGKTXGG4';
};

// KursRadar GTM Server Container (für Referenz)
export const getGTMServerContainerId = (): string => {
  return 'GTM-NLLB6F85';
};

// Taggrs Server-URL für Server-seitiges Tracking
export const getTaggrsServerUrl = (): string => {
  return 'https://sst.kurs-radar.com';
};

export const getTrackingSource = (): 'standalone' | 'embed' => {
  return isEmbedded() ? 'embed' : 'standalone';
};
