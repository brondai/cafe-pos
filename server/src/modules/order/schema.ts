import { z } from 'zod';

// ── Shared enums ────────────────────────────────────────────────────────────

export const orderStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']);
export const paymentMethodSchema = z.enum(['CASH', 'CARD', 'QR']);
export const serviceModeSchema = z.enum(['DINE_IN', 'TAKEAWAY', 'INSTANT', 'CUSTOM']);

// ── OrderItem schemas ────────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  menuItemId: z.string().nullable(),
  variantId: z.string().nullable(),
  name: z.string(),
  variantName: z.string(),
  priceAmount: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const addOrderItemInputSchema = z.object({
  menuItemId: z.string().optional(),
  variantId: z.string().optional(),
  name: z.string().min(1),
  variantName: z.string().default('Default'),
  priceAmount: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(999),
  notes: z.string().max(500).optional(),
});

export const updateOrderItemInputSchema = z.object({
  quantity: z.number().int().min(1).max(999).optional(),
  notes: z.string().max(500).nullable().optional(),
});

// ── Order schemas ────────────────────────────────────────────────────────────

export const orderSchema = z.object({
  id: z.string(),
  locationId: z.string(),
  tableNumber: z.string(),
  customerName: z.string().nullable(),
  serviceMode: serviceModeSchema,
  status: orderStatusSchema,
  subtotalAmount: z.number().int().nonnegative(),
  taxAmount: z.number().int().nonnegative(),
  totalAmount: z.number().int().nonnegative(),
  currencyCode: z.string(),
  paymentMethod: paymentMethodSchema.nullable(),
  paidAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(orderItemSchema),
});

// ── Procedure input schemas ──────────────────────────────────────────────────

export const createOrderInputSchema = z.object({
  locationId: z.string().min(1),
  tableNumber: z.string().min(1),
  customerName: z.string().max(200).optional(),
  serviceMode: serviceModeSchema.default('DINE_IN'),
  items: z.array(addOrderItemInputSchema).min(1),
  subtotalAmount: z.number().int().nonnegative(),
  taxAmount: z.number().int().nonnegative(),
  totalAmount: z.number().int().nonnegative(),
  currencyCode: z.string().default('NPR'),
});

export const addItemInputSchema = z.object({
  orderId: z.string().min(1),
  item: addOrderItemInputSchema,
});

export const updateItemInputSchema = z.object({
  orderId: z.string().min(1),
  itemId: z.string().min(1),
  changes: updateOrderItemInputSchema,
});

export const removeItemInputSchema = z.object({
  orderId: z.string().min(1),
  itemId: z.string().min(1),
});

export const markPaidInputSchema = z.object({
  orderId: z.string().min(1),
  paymentMethod: paymentMethodSchema,
  totalAmount: z.number().int().nonnegative(),
});

export const markCompletedInputSchema = z.object({
  orderId: z.string().min(1),
});

export const activeOrdersInputSchema = z.object({
  locationId: z.string().min(1),
});

// ── Inferred types ───────────────────────────────────────────────────────────

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
export type AddItemInput = z.infer<typeof addItemInputSchema>;
export type UpdateItemInput = z.infer<typeof updateItemInputSchema>;
export type RemoveItemInput = z.infer<typeof removeItemInputSchema>;
export type MarkPaidInput = z.infer<typeof markPaidInputSchema>;
export type MarkCompletedInput = z.infer<typeof markCompletedInputSchema>;
export type ActiveOrdersInput = z.infer<typeof activeOrdersInputSchema>;
