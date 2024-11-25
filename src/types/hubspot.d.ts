interface HubSpotFormOptions {
  portalId: string;
  formId: string;
  target: string;
  region?: string;
  css?: string;
  onFormReady?: () => void;
  onFormSubmitted?: () => void;
}

interface HubSpotForms {
  create: (options: HubSpotFormOptions) => void;
}

interface HubSpot {
  forms: HubSpotForms;
}

declare global {
  interface Window {
    hbspt: HubSpot;
  }
}

export {};