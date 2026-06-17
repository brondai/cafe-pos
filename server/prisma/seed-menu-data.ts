export type SeedCategory = {
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
};

export type SeedMenuItem = {
  name: string;
  slug: string;
  categorySlug: string;
  description?: string;
  itemType: 'FOOD' | 'DRINK' | 'ALCOHOL' | 'TOBACCO' | 'HOOKAH' | 'ADD_ON';
  isPopular?: boolean;
  sortOrder: number;
  variants: Array<{
    name: string;
    priceNpr: number;
    attributes?: Record<string, boolean | number | string>;
    sortOrder?: number;
  }>;
};

export const seedLocation = {
  id: 'seed-location-keroneva',
  name: 'Keroneva Cafe',
  currencyCode: 'NPR',
  opensAt: '07:30',
  closesAt: '21:00',
  foodLastOrderTime: '20:00',
};

export const seedPosSettings = {
  invoiceTitle: 'Tax Invoice',
  receiptFooter: 'Thank you for visiting Keroneva Cafe.',
  currencySymbol: 'Rs',
};

export const seedCategories: SeedCategory[] = [
  { name: 'Coffee', slug: 'coffee', icon: 'coffee', sortOrder: 10 },
  { name: 'Tea', slug: 'tea', icon: 'tea', sortOrder: 20 },
  { name: 'Momo', slug: 'momo', icon: 'dumpling', sortOrder: 30 },
  { name: 'Rice And Noodles', slug: 'rice-noodles', icon: 'bowl', sortOrder: 40 },
  { name: 'Sandwiches', slug: 'sandwiches', icon: 'sandwich', sortOrder: 50 },
  { name: 'Add Ons', slug: 'add-ons', icon: 'plus', sortOrder: 60 },
  { name: 'Wine', slug: 'wine', icon: 'wine', sortOrder: 70 },
  { name: 'Spirits', slug: 'spirits', icon: 'glass', sortOrder: 80 },
];

// Migration path from src/data/menuData.ts:
// - categories map to seedCategories by slug/name/sortOrder.
// - each frontend menu item maps to MenuItem, with popular -> isPopular.
// - a single frontend price maps to one "Default" MenuItemVariant.
// Physical menu prices are VAT-inclusive, so priceNpr is stored directly as minor units in the seed.
export const seedMenuItems: SeedMenuItem[] = [
  {
    name: 'Espresso',
    slug: 'espresso',
    categorySlug: 'coffee',
    itemType: 'DRINK',
    sortOrder: 10,
    variants: [{ name: 'Default', priceNpr: 100 }],
  },
  {
    name: 'Cappuccino',
    slug: 'cappuccino',
    categorySlug: 'coffee',
    itemType: 'DRINK',
    isPopular: true,
    sortOrder: 20,
    variants: [{ name: 'Default', priceNpr: 165 }],
  },
  {
    name: 'Flavoured Latte',
    slug: 'flavoured-latte',
    categorySlug: 'coffee',
    itemType: 'DRINK',
    sortOrder: 30,
    variants: [
      { name: 'Vanilla', priceNpr: 210, attributes: { flavor: 'vanilla' }, sortOrder: 10 },
      { name: 'Caramel', priceNpr: 210, attributes: { flavor: 'caramel' }, sortOrder: 20 },
      { name: 'Hazelnut', priceNpr: 210, attributes: { flavor: 'hazelnut' }, sortOrder: 30 },
    ],
  },
  {
    name: 'Masala Milk Tea',
    slug: 'masala-milk-tea',
    categorySlug: 'tea',
    itemType: 'DRINK',
    sortOrder: 10,
    variants: [{ name: 'Default', priceNpr: 60 }],
  },
  {
    name: 'Momo',
    slug: 'momo',
    categorySlug: 'momo',
    description: 'Representative physical menu momo variants by filling and preparation.',
    itemType: 'FOOD',
    isPopular: true,
    sortOrder: 10,
    variants: [
      { name: 'Veg Steam', priceNpr: 160, attributes: { filling: 'veg', preparation: 'steam' }, sortOrder: 10 },
      { name: 'Veg Kothey', priceNpr: 180, attributes: { filling: 'veg', preparation: 'kothey' }, sortOrder: 20 },
      { name: 'Chicken Steam', priceNpr: 190, attributes: { filling: 'chicken', preparation: 'steam' }, sortOrder: 30 },
      { name: 'Chicken Fried', priceNpr: 220, attributes: { filling: 'chicken', preparation: 'fried' }, sortOrder: 40 },
      { name: 'Buff Chilly', priceNpr: 220, attributes: { filling: 'buff', preparation: 'chilly' }, sortOrder: 50 },
    ],
  },
  {
    name: 'Chowmein',
    slug: 'chowmein',
    categorySlug: 'rice-noodles',
    itemType: 'FOOD',
    sortOrder: 10,
    variants: [
      { name: 'Veg', priceNpr: 150, attributes: { protein: 'veg' }, sortOrder: 10 },
      { name: 'Egg', priceNpr: 200, attributes: { protein: 'egg' }, sortOrder: 20 },
      { name: 'Chicken', priceNpr: 200, attributes: { protein: 'chicken' }, sortOrder: 30 },
      { name: 'Mixed', priceNpr: 240, attributes: { protein: 'mixed' }, sortOrder: 40 },
    ],
  },
  {
    name: 'Fried Rice',
    slug: 'fried-rice',
    categorySlug: 'rice-noodles',
    itemType: 'FOOD',
    sortOrder: 20,
    variants: [
      { name: 'Veg', priceNpr: 150, attributes: { protein: 'veg' }, sortOrder: 10 },
      { name: 'Egg', priceNpr: 200, attributes: { protein: 'egg' }, sortOrder: 20 },
      { name: 'Chicken', priceNpr: 200, attributes: { protein: 'chicken' }, sortOrder: 30 },
      { name: 'Mixed', priceNpr: 240, attributes: { protein: 'mixed' }, sortOrder: 40 },
    ],
  },
  {
    name: 'Club Sandwich',
    slug: 'club-sandwich',
    categorySlug: 'sandwiches',
    itemType: 'FOOD',
    sortOrder: 10,
    variants: [
      { name: 'Veg', priceNpr: 270, attributes: { style: 'veg' }, sortOrder: 10 },
      { name: 'Non Veg', priceNpr: 380, attributes: { style: 'non-veg' }, sortOrder: 20 },
    ],
  },
  {
    name: 'Ice Cream Scoop',
    slug: 'ice-cream-scoop',
    categorySlug: 'add-ons',
    itemType: 'ADD_ON',
    sortOrder: 10,
    variants: [{ name: 'Default', priceNpr: 70 }],
  },
  {
    name: 'Big Master Wine',
    slug: 'big-master-wine',
    categorySlug: 'wine',
    itemType: 'ALCOHOL',
    sortOrder: 10,
    variants: [
      { name: 'Glass', priceNpr: 300, attributes: { measure: 'glass' }, sortOrder: 10 },
      { name: 'Bottle', priceNpr: 1200, attributes: { measure: 'bottle' }, sortOrder: 20 },
    ],
  },
  {
    name: 'Khukuri Rum',
    slug: 'khukuri-rum',
    categorySlug: 'spirits',
    itemType: 'ALCOHOL',
    sortOrder: 10,
    variants: [
      { name: 'Full', priceNpr: 2600, attributes: { measure: 'full' }, sortOrder: 10 },
      { name: 'Half', priceNpr: 1350, attributes: { measure: 'half' }, sortOrder: 20 },
      { name: 'Quarter', priceNpr: 700, attributes: { measure: 'quarter' }, sortOrder: 30 },
      { name: '90ml', priceNpr: 380, attributes: { measure: '90ml' }, sortOrder: 40 },
      { name: '60ml', priceNpr: 250, attributes: { measure: '60ml' }, sortOrder: 50 },
      { name: '30ml', priceNpr: 140, attributes: { measure: '30ml' }, sortOrder: 60 },
    ],
  },
];
