import { OrderCancelledListener } from "../order-cancelled-listener";
import { stanWrapper } from '../../../stan-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from "mongoose";
import { OrderCancelledEvent } from "@tuebora/gittix-common";
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new OrderCancelledListener(stanWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'concer',
        price: 20,
        userId: 'asdf'
    });
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { msg, data, ticket, orderId, listener };
};

it('updates the ticket, publishes and event and acks the message', async () => {
    const { msg, data, ticket, orderId, listener } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(stanWrapper.client.publish).toHaveBeenCalled();
});