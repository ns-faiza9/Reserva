/** Featured venue types with representative company names from catalog */
export const AD_CATEGORIES = [
  { type: 'Executive Boardroom', tagline: 'Board meetings & strategy', accent: '#2c2c2c' },
  { type: 'Conference hall', tagline: 'Large events & summits', accent: '#7c3aed' },
  { type: 'hotel room', tagline: 'Comfortable stays', accent: '#64748b' },
  { type: 'suite room', tagline: 'Premium stays', accent: '#b8860b' },
  { type: 'villa', tagline: 'Scenic getaways', accent: '#0ea5e9' },
];

export const normalizeType = (type) => (type || '').trim().toLowerCase();

export const countByType = (resources, typeName) =>
  resources.filter((r) => normalizeType(r.type) === normalizeType(typeName)).length;

export const companyForType = (resources, typeName, fallback) => {
  const match = resources.find((r) => normalizeType(r.type) === normalizeType(typeName));
  return match?.name || fallback;
};
