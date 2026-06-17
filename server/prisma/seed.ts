import { prisma } from '../src/db/client.js';
import { seedCategories, seedLocation, seedMenuItems, seedPosSettings } from './seed-menu-data.js';

const toMinorUnits = (amount: number) => Math.round(amount * 100);

async function seedMenu() {
  const location = await prisma.location.upsert({
    where: { id: seedLocation.id },
    update: {
      name: seedLocation.name,
      currencyCode: seedLocation.currencyCode,
      opensAt: seedLocation.opensAt,
      closesAt: seedLocation.closesAt,
      foodLastOrderTime: seedLocation.foodLastOrderTime,
    },
    create: seedLocation,
  });

  await prisma.posSettings.upsert({
    where: { locationId: location.id },
    update: seedPosSettings,
    create: {
      ...seedPosSettings,
      locationId: location.id,
    },
  });

  const categoryIdsBySlug = new Map<string, string>();

  for (const categorySeed of seedCategories) {
    const category = await prisma.category.upsert({
      where: {
        locationId_slug: {
          locationId: location.id,
          slug: categorySeed.slug,
        },
      },
      update: {
        name: categorySeed.name,
        icon: categorySeed.icon,
        sortOrder: categorySeed.sortOrder,
        isActive: true,
      },
      create: {
        ...categorySeed,
        locationId: location.id,
      },
    });

    categoryIdsBySlug.set(category.slug, category.id);
  }

  for (const itemSeed of seedMenuItems) {
    const categoryId = categoryIdsBySlug.get(itemSeed.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing seed category "${itemSeed.categorySlug}" for menu item "${itemSeed.name}"`);
    }

    const menuItem = await prisma.menuItem.upsert({
      where: {
        locationId_slug: {
          locationId: location.id,
          slug: itemSeed.slug,
        },
      },
      update: {
        categoryId,
        name: itemSeed.name,
        description: itemSeed.description,
        itemType: itemSeed.itemType,
        isPopular: itemSeed.isPopular ?? false,
        sortOrder: itemSeed.sortOrder,
        isActive: true,
      },
      create: {
        locationId: location.id,
        categoryId,
        name: itemSeed.name,
        slug: itemSeed.slug,
        description: itemSeed.description,
        itemType: itemSeed.itemType,
        isPopular: itemSeed.isPopular ?? false,
        sortOrder: itemSeed.sortOrder,
      },
    });

    for (const [index, variantSeed] of itemSeed.variants.entries()) {
      await prisma.menuItemVariant.upsert({
        where: {
          menuItemId_name: {
            menuItemId: menuItem.id,
            name: variantSeed.name,
          },
        },
        update: {
          priceAmount: toMinorUnits(variantSeed.priceNpr),
          currencyCode: seedLocation.currencyCode,
          attributes: variantSeed.attributes,
          sortOrder: variantSeed.sortOrder ?? index * 10,
          isActive: true,
        },
        create: {
          menuItemId: menuItem.id,
          name: variantSeed.name,
          priceAmount: toMinorUnits(variantSeed.priceNpr),
          currencyCode: seedLocation.currencyCode,
          attributes: variantSeed.attributes,
          sortOrder: variantSeed.sortOrder ?? index * 10,
        },
      });
    }
  }

  console.log(`Seeded ${seedCategories.length} categories and ${seedMenuItems.length} menu items for ${location.name}.`);
}

seedMenu()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
