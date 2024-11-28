interface HubSpotFormOptions {
  portalId: string;
  formId: string;
  target: string;
  region?: string;
  onFormReady?: () => void;
  onFormSubmitted?: () => void;
}

interface HubSpotForms {
  create: (options: HubSpotFormOptions) => void;
}

interface HubSpotTrackingObject {
  push: (args: any[]) => void;
}

interface HubSpot {
  forms: HubSpotForms;
}

declare global {
  interface Window {
    hbspt: HubSpot;
    _hsq: HubSpotTrackingObject;
  }
}

export {};