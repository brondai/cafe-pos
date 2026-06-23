import { publicProcedure, router } from '../../trpc/init.js';
import {
  orderSchema,
  createOrderInputSchema,
  addItemInputSchema,
  updateItemInputSchema,
  removeItemInputSchema,
  markPaidInputSchema,
  markCompletedInputSchema,
  activeOrdersInputSchema,
} from './schema.js';
import {
  createOrder,
  addOrderItem,
  updateOrderItem,
  removeOrderItem,
  markOrderPaid,
  markOrderCompleted,
  getActiveOrders,
} from './service.js';

export const orderRouter = router({
  /** Create a new order with at least one item. */
  create: publicProcedure
    .input(createOrderInputSchema)
    .output(orderSchema)
    .mutation(({ ctx, input }) => createOrder(ctx.db, input)),

  /** Add an item to an active order and recalculate totals. */
  addItem: publicProcedure
    .input(addItemInputSchema)
    .output(orderSchema)
    .mutation(({ ctx, input }) => addOrderItem(ctx.db, input)),

  /** Update quantity or notes on an existing order item. */
  updateItem: publicProcedure
    .input(updateItemInputSchema)
    .output(orderSchema)
    .mutation(({ ctx, input }) => updateOrderItem(ctx.db, input)),

  /** Remove an item from an active order and recalculate totals. */
  removeItem: publicProcedure
    .input(removeItemInputSchema)
    .output(orderSchema)
    .mutation(({ ctx, input }) => removeOrderItem(ctx.db, input)),

  /** Mark an active order as paid and completed in one step. */
  markPaid: publicProcedure
    .input(markPaidInputSchema)
    .output(orderSchema)
    .mutation(({ ctx, input }) => markOrderPaid(ctx.db, input)),

  /** Mark an active order as completed without recording a payment method. */
  markCompleted: publicProcedure
    .input(markCompletedInputSchema)
    .output(orderSchema)
    .mutation(({ ctx, input }) => markOrderCompleted(ctx.db, input)),

  /** Fetch all active orders for a location, oldest first. */
  listActive: publicProcedure
    .input(activeOrdersInputSchema)
    .output(orderSchema.array())
    .query(({ ctx, input }) => getActiveOrders(ctx.db, input)),
});
