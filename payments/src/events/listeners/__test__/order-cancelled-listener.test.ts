import { OrderCancelledListener } from "../order-cancelled-listener";
import { stanWrapper } from "../../../stan-wrapper";
import { Order } from "../../../models/order";
import mongoose from 'mongoose';
import { OrderStatus, OrderCancelledEvent } from '@tuebora/gittix-common';
import { Message } from "node-nats-streaming";

const setup = async () => {
    const listener = new OrderCancelledListener(stanWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 10,
        userId: 'asldkfj',
        version: 0
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'asldkfj'
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, order };
};

it('updates the status of the order', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});