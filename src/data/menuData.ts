import type { MenuItem, Category, Table } from '@/types';

export const categories: Category[] = [
  { id: 'all', name: 'All Items', icon: 'Grid3X3' },
  { id: 'coffee', name: 'Coffee', icon: 'Coffee' },
  { id: 'tea', name: 'Tea', icon: 'CupSoda' },
  { id: 'pastry', name: 'Pastries', icon: 'Croissant' },
  { id: 'breakfast', name: 'Breakfast', icon: 'Egg' },
  { id: 'lunch', name: 'Lunch', icon: 'UtensilsCrossed' },
  { id: 'dessert', name: 'Desserts', icon: 'IceCream' },
  { id: 'beverages', name: 'Drinks', icon: 'GlassWater' },
];

export const menuItems: MenuItem[] = [
  // Coffee
  { id: 'c1', name: 'Espresso', description: 'Rich and bold single shot', price: 3.50, category: 'coffee', popular: true },
  { id: 'c2', name: 'Americano', description: 'Espresso with hot water', price: 4.00, category: 'coffee' },
  { id: 'c3', name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 4.50, category: 'coffee', popular: true },
  { id: 'c4', name: 'Latte', description: 'Espresso with steamed milk', price: 4.75, category: 'coffee', popular: true },
  { id: 'c5', name: 'Mocha', description: 'Chocolate espresso with milk', price: 5.50, category: 'coffee' },
  { id: 'c6', name: 'Macchiato', description: 'Espresso with milk foam', price: 4.25, category: 'coffee' },
  { id: 'c7', name: 'Cold Brew', description: 'Steeped cold coffee', price: 5.00, category: 'coffee', popular: true },
  { id: 'c8', name: 'Flat White', description: 'Double espresso with microfoam', price: 4.75, category: 'coffee' },

  // Tea
  { id: 't1', name: 'Earl Grey', description: 'Black tea with bergamot', price: 3.75, category: 'tea' },
  { id: 't2', name: 'Green Tea', description: 'Japanese sencha', price: 3.50, category: 'tea' },
  { id: 't3', name: 'Chai Latte', description: 'Spiced tea with steamed milk', price: 4.75, category: 'tea', popular: true },
  { id: 't4', name: 'Matcha Latte', description: 'Premium matcha with milk', price: 5.50, category: 'tea', popular: true },
  { id: 't5', name: 'Peppermint', description: 'Refreshing herbal tea', price: 3.50, category: 'tea' },
  { id: 't6', name: 'Chamomile', description: 'Calming floral tea', price: 3.50, category: 'tea' },

  // Pastries
  { id: 'p1', name: 'Croissant', description: 'Buttery flaky pastry', price: 3.25, category: 'pastry', popular: true },
  { id: 'p2', name: 'Pain au Chocolat', description: 'Chocolate filled pastry', price: 3.75, category: 'pastry' },
  { id: 'p3', name: 'Cinnamon Roll', description: 'Soft roll with cinnamon glaze', price: 4.25, category: 'pastry', popular: true },
  { id: 'p4', name: 'Blueberry Muffin', description: 'Fresh blueberry baked muffin', price: 3.50, category: 'pastry' },
  { id: 'p5', name: 'Danish', description: 'Fruit filled pastry', price: 3.75, category: 'pastry' },
  { id: 'p6', name: 'Scone', description: 'Traditional British scone', price: 3.25, category: 'pastry' },

  // Breakfast
  { id: 'b1', name: 'Avocado Toast', description: 'Sourdough with smashed avocado', price: 8.50, category: 'breakfast', popular: true },
  { id: 'b2', name: 'Eggs Benedict', description: 'Poached eggs with hollandaise', price: 12.00, category: 'breakfast', popular: true },
  { id: 'b3', name: 'Pancakes', description: 'Fluffy stack with maple syrup', price: 9.50, category: 'breakfast' },
  { id: 'b4', name: 'Granola Bowl', description: 'Yogurt with fresh fruits', price: 7.50, category: 'breakfast' },
  { id: 'b5', name: 'Breakfast Burrito', description: 'Eggs, cheese, and salsa', price: 9.00, category: 'breakfast' },

  // Lunch
  { id: 'l1', name: 'Caesar Salad', description: 'Romaine with parmesan and croutons', price: 10.50, category: 'lunch' },
  { id: 'l2', name: 'Club Sandwich', description: 'Triple decker with turkey and bacon', price: 11.50, category: 'lunch', popular: true },
  { id: 'l3', name: 'Soup of the Day', description: 'Chef\'s daily selection', price: 6.50, category: 'lunch' },
  { id: 'l4', name: 'Quiche', description: 'Savory egg tart', price: 9.50, category: 'lunch' },
  { id: 'l5', name: 'Panini', description: 'Grilled Italian sandwich', price: 10.00, category: 'lunch' },

  // Desserts
  { id: 'd1', name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 6.50, category: 'dessert', popular: true },
  { id: 'd2', name: 'Cheesecake', description: 'New York style', price: 6.00, category: 'dessert' },
  { id: 'd3', name: 'Chocolate Cake', description: 'Rich layered cake', price: 6.50, category: 'dessert' },
  { id: 'd4', name: 'Fruit Tart', description: 'Seasonal fresh fruits', price: 5.50, category: 'dessert' },
  { id: 'd5', name: 'Brownie', description: 'Warm chocolate brownie', price: 4.50, category: 'dessert' },

  // Beverages
  { id: 'bv1', name: 'Orange Juice', description: 'Freshly squeezed', price: 4.50, category: 'beverages' },
  { id: 'bv2', name: 'Lemonade', description: 'Fresh squeezed lemonade', price: 3.75, category: 'beverages' },
  { id: 'bv3', name: 'Smoothie', description: 'Mixed berry blend', price: 5.50, category: 'beverages', popular: true },
  { id: 'bv4', name: 'Iced Tea', description: 'House brewed black tea', price: 3.50, category: 'beverages' },
  { id: 'bv5', name: 'Sparkling Water', description: 'Premium mineral water', price: 2.50, category: 'beverages' },
];

export const tables: Table[] = Array.from({ length: 20 }, (_, i) => ({
  id: `t${i + 1}`,
  number: `${i + 1}`,
  status: i < 5 ? 'occupied' : i < 7 ? 'reserved' : 'available',
  seats: i % 3 === 0 ? 4 : i % 3 === 1 ? 2 : 6,
}));
