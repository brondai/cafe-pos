import { TRPCError } from '@trpc/server';
import type { PrismaClient } from '../../db/generated/prisma/client.js';
import type {
  CreateOrderInput,
  AddItemInput,
  UpdateItemInput,
  RemoveItemInput,
  MarkPaidInput,
  MarkCompletedInput,
  ActiveOrdersInput,
} from './schema.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const orderInclude = { items: { orderBy: { createdAt: 'asc' as const } } };

function requireOrder(
  order: { id: string; status: string } | null,
  orderId: string,
): { id: string; status: string } {
  if (!order) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Order ${orderId} not found`,
    });
  }
  return order;
}

function requireActive(order: { id: string; status: string }): void {
  if (order.status !== 'ACTIVE') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Order ${order.id} is not active (status: ${order.status})`,
    });
  }
}

async function recalcOrder(db: PrismaClient, orderId: string) {
  const items = await db.orderItem.findMany({ where: { orderId } });
  const subtotal = items.reduce((s, i) => s + i.priceAmount * i.quantity, 0);
  return db.order.update({
    where: { id: orderId },
    data: { subtotalAmount: subtotal, totalAmount: subtotal },
    include: orderInclude,
  });
}

// ── Service functions ────────────────────────────────────────────────────────

export async function createOrder(db: PrismaClient, input: CreateOrderInput) {
  return db.order.create({
    data: {
      locationId: input.locationId,
      tableNumber: input.tableNumber,
      customerName: input.customerName ?? null,
      serviceMode: input.serviceMode,
      status: 'ACTIVE',
      subtotalAmount: input.subtotalAmount,
      taxAmount: input.taxAmount,
      totalAmount: input.totalAmount,
      currencyCode: input.currencyCode,
      paymentMethod: null,
      paidAt: null,
      completedAt: null,
      items: {
        create: input.items.map((item) => ({
          menuItemId: item.menuItemId ?? null,
          variantId: item.variantId ?? null,
          name: item.name,
          variantName: item.variantName,
          priceAmount: item.priceAmount,
          quantity: item.quantity,
          notes: item.notes ?? null,
        })),
      },
    },
    include: orderInclude,
  });
}

export async function addOrderItem(db: PrismaClient, input: AddItemInput) {
  const order = requireOrder(
    await db.order.findUnique({ where: { id: input.orderId } }),
    input.orderId,
  );
  requireActive(order);

  const { item } = input;
  await db.orderItem.create({
    data: {
      orderId: input.orderId,
      menuItemId: item.menuItemId ?? null,
      variantId: item.variantId ?? null,
      name: item.name,
      variantName: item.variantName,
      priceAmount: item.priceAmount,
      quantity: item.quantity,
      notes: item.notes ?? null,
    },
  });

  return recalcOrder(db, input.orderId);
}

export async function updateOrderItem(db: PrismaClient, input: UpdateItemInput) {
  const order = requireOrder(
    await db.order.findUnique({ where: { id: input.orderId } }),
    input.orderId,
  );
  requireActive(order);

  const existing = await db.orderItem.findUnique({ where: { id: input.itemId } });
  if (!existing || existing.orderId !== input.orderId) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Order item ${input.itemId} not found on order ${input.orderId}`,
    });
  }

  await db.orderItem.update({
    where: { id: input.itemId },
    data: {
      ...(input.changes.quantity !== undefined && { quantity: input.changes.quantity }),
      ...(input.changes.notes !== undefined && { notes: input.changes.notes }),
    },
  });

  return recalcOrder(db, input.orderId);
}

export async function removeOrderItem(db: PrismaClient, input: RemoveItemInput) {
  const order = requireOrder(
    await db.order.findUnique({ where: { id: input.orderId } }),
    input.orderId,
  );
  requireActive(order);

  const existing = await db.orderItem.findUnique({ where: { id: input.itemId } });
  if (!existing || existing.orderId !== input.orderId) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Order item ${input.itemId} not found on order ${input.orderId}`,
    });
  }

  await db.orderItem.delete({ where: { id: input.itemId } });

  return recalcOrder(db, input.orderId);
}

export async function markOrderPaid(db: PrismaClient, input: MarkPaidInput) {
  const order = requireOrder(
    await db.order.findUnique({ where: { id: input.orderId } }),
    input.orderId,
  );
  requireActive(order);

  return db.order.update({
    where: { id: input.orderId },
    data: {
      status: 'COMPLETED',
      paymentMethod: input.paymentMethod,
      totalAmount: input.totalAmount,
      paidAt: new Date(),
      completedAt: new Date(),
    },
    include: orderInclude,
  });
}

export async function markOrderCompleted(db: PrismaClient, input: MarkCompletedInput) {
  const order = requireOrder(
    await db.order.findUnique({ where: { id: input.orderId } }),
    input.orderId,
  );
  requireActive(order);

  return db.order.update({
    where: { id: input.orderId },
    data: { status: 'COMPLETED', completedAt: new Date() },
    include: orderInclude,
  });
}

export async function getActiveOrders(db: PrismaClient, input: ActiveOrdersInput) {
  return db.order.findMany({
    where: { locationId: input.locationId, status: 'ACTIVE' },
    include: orderInclude,
    orderBy: { createdAt: 'asc' },
  });
}
