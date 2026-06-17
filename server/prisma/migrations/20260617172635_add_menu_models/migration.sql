-- CreateEnum
CREATE TYPE "ServiceMode" AS ENUM ('DINE_IN', 'TAKEAWAY', 'INSTANT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MenuItemType" AS ENUM ('FOOD', 'DRINK', 'ALCOHOL', 'TOBACCO', 'HOOKAH', 'ADD_ON');

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "currencyCode" TEXT NOT NULL DEFAULT 'NPR',
    "opensAt" TEXT,
    "closesAt" TEXT,
    "foodLastOrderTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosSettings" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "invoiceTitle" TEXT NOT NULL DEFAULT 'Tax Invoice',
    "receiptFooter" TEXT NOT NULL DEFAULT 'Thank you for visiting.',
    "currencySymbol" TEXT NOT NULL DEFAULT 'Rs',
    "autoPrintReceipts" BOOLEAN NOT NULL DEFAULT true,
    "defaultServiceMode" "ServiceMode" NOT NULL DEFAULT 'DINE_IN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "itemType" "MenuItemType" NOT NULL DEFAULT 'FOOD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItemVariant" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "sku" TEXT,
    "priceAmount" INTEGER NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'NPR',
    "attributes" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItemVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PosSettings_locationId_key" ON "PosSettings"("locationId");

-- CreateIndex
CREATE INDEX "Category_locationId_sortOrder_idx" ON "Category"("locationId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Category_locationId_slug_key" ON "Category"("locationId", "slug");

-- CreateIndex
CREATE INDEX "MenuItem_categoryId_sortOrder_idx" ON "MenuItem"("categoryId", "sortOrder");

-- CreateIndex
CREATE INDEX "MenuItem_locationId_itemType_idx" ON "MenuItem"("locationId", "itemType");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_locationId_slug_key" ON "MenuItem"("locationId", "slug");

-- CreateIndex
CREATE INDEX "MenuItemVariant_menuItemId_sortOrder_idx" ON "MenuItemVariant"("menuItemId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItemVariant_menuItemId_name_key" ON "MenuItemVariant"("menuItemId", "name");

-- AddForeignKey
ALTER TABLE "PosSettings" ADD CONSTRAINT "PosSettings_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemVariant" ADD CONSTRAINT "MenuItemVariant_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
