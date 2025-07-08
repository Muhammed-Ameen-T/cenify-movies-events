// Templates for predefined layouts
export const TEMPLATES = {
    EMPTY: {
      name: 'Empty Layout',
      rows: 0,
      cols: 0,
      pattern: 'empty'
    },
    STANDARD: {
      name: 'Standard',
      rows: 8,
      cols: 12,
      pattern: 'regular'
    },
    IMAX: {
      name: 'IMAX',
      rows: 12,
      cols: 20,
      pattern: 'curved'
    },
    PREMIUM: {
      name: 'Premium Theater',
      rows: 6,
      cols: 10,
      pattern: 'premium'
    },
    MULTIPLEX: {
      name: 'Multiplex',
      rows: 10,
      cols: 15,
      pattern: 'multiplex'
    }
  };
  
  export type TemplateType = keyof typeof TEMPLATES;