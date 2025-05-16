// // Templates for predefined layouts
// export const TEMPLATES = {
//     EMPTY: {
//       name: 'Empty Layout',
//       rows: 0,
//       cols: 0,
//       pattern: 'empty'
//     },
//     STANDARD: {
//       name: 'Standard',
//       rows: 8,
//       cols: 12,
//       pattern: 'regular'
//     },
//     IMAX: {
//       name: 'IMAX',
//       rows: 12,
//       cols: 20,
//       pattern: 'curved'
//     },
//     PREMIUM: {
//       name: 'Premium Theater',
//       rows: 6,
//       cols: 10,
//       pattern: 'premium'
//     },
//     MULTIPLEX: {
//       name: 'Multiplex',
//       rows: 10,
//       cols: 15,
//       pattern: 'multiplex'
//     }
//   };
  
//   export type TemplateType = keyof typeof TEMPLATES;


export const TEMPLATES = {
  EMPTY: { name: 'Empty Layout', rows: 0, cols: 0 },
  SMALL: { name: 'Small Theater (60 seats)', rows: 6, cols: 10 },
  MEDIUM: { name: 'Medium Theater (120 seats)', rows: 10, cols: 12 },
  LARGE: { name: 'Large Theater (210 seats)', rows: 14, cols: 15 },
  IMAX: { name: 'IMAX Experience (250 seats)', rows: 16, cols: 18, curve: true },
};

export type TemplateType = keyof typeof TEMPLATES;