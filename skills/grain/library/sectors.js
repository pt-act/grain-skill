export const SECTORS = [
  { id: 'food-drink', name: 'Food & Drink', examples: 'restaurants, bakeries, roasters, breweries, markets, menus' },
  { id: 'craft', name: 'Craft & Making', examples: 'furniture, ceramics, leather, workshops, makers' },
  { id: 'hospitality', name: 'Hospitality', examples: 'hotels, inns, guest houses, huts, retreats' },
  { id: 'culture', name: 'Culture & Arts', examples: 'museums, galleries, theatres, festivals, editions' },
  { id: 'product', name: 'Product', examples: 'goods, objects, editions, one thing done well' },
  { id: 'professional-services', name: 'Professional Services', examples: 'studies, practices, firms, clinics, advisories' },
  { id: 'fashion', name: 'Fashion & Objects', examples: 'clothing, shoes, accessories, eyewear' },
  { id: 'outdoors', name: 'Outdoors & Wild', examples: 'trails, huts, expeditions, gear, nature' },
  { id: 'wellness', name: 'Wellness & Care', examples: 'clinics, spas, therapies, tonics, retreats' },
  { id: 'software-studio', name: 'Software & Studio', examples: 'studios, tools, platforms, apps' },
];

export const SECTOR_BY_ID = Object.fromEntries(SECTORS.map((s) => [s.id, s]));
