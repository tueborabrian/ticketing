import { TicketUpdatedListener } from '../ticket-updated-listener';
import { stanWrapper } from '../../../stan-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@tuebora/gittix-common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // Create a listener
    const listener = new TicketUpdatedListener(stanWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    // Create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 999,
        userId: 'ablskdjf'
    };

    // Create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    // return all of this stuff
    return { listener, msg, data, ticket };
};

it('finds, updates and saves a ticket', async () => {
    const { listener, msg, data, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, msg, data } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
    const { msg, data, listener, ticket } = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (err) {
        // do nothing
    }

    expect(msg.ack).not.toHaveBeenCalled()
});