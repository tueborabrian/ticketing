import express, { Request, Response } from 'express';
import { NotAuthorizedError, NotFoundError, requireAuth } from '@tuebora/gittix-common'
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { stanWrapper } from '../stan-wrapper';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // publishiong an event saying this was cancelled!
    new OrderCancelledPublisher(stanWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    });

    res.status(204).send(order);
});

export { router as deleteOrderRouter };