/** Featured venue types with representative company names from catalog */
export const AD_CATEGORIES = [
  { type: 'Executive Boardroom', company: 'Yoveo Hotel', tagline: 'Board meetings & strategy', accent: '#2c2c2c' },
  { type: 'Beachfront Villa', company: 'InnoZ Resorts', tagline: 'Coastal retreats', accent: '#0ea5e9' },
  { type: 'Conference hall', company: 'Babbleblab Hotel', tagline: 'Large events & summits', accent: '#7c3aed' },
  { type: 'Luxury Suite', company: 'Hotel of Mudo', tagline: 'Premium stays', accent: '#b8860b' },
  { type: 'Room B', company: 'Quamba Hotel', tagline: 'Flexible workspace', accent: '#64748b' },
  { type: 'Room A', company: 'Gigashots Hotel', tagline: 'Team collaboration', accent: '#059669' },
  { type: 'Penthouse Suite', company: 'Trilith Hotel', tagline: 'Skyline views', accent: '#db2777' },
  { type: 'Room C', company: 'Yozio Hotel', tagline: 'Quiet focus zones', accent: '#0891b2' },
  { type: 'Mountain View Villa', company: 'JumpXS Resorts', tagline: 'Scenic getaways', accent: '#65a30d' },
];

export const normalizeType = (type) => (type || '').trim().toLowerCase();

export const countByType = (resources, typeName) =>
  resources.filter((r) => normalizeType(r.type) === normalizeType(typeName)).length;

export const companyForType = (resources, typeName, fallback) => {
  const match = resources.find((r) => normalizeType(r.type) === normalizeType(typeName));
  return match?.name || fallback;
};
