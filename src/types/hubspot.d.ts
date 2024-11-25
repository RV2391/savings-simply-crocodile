interface HubSpotFormOptions {
  region: string;
  portalId: string;
  formId: string;
  target: string;
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