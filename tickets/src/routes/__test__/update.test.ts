import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { stanWrapper } from '../../stan-wrapper';

it('returns a 404 status if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${id}`).set('Cookie', global.signin()).send({
        title: 'aslkdfj',
        price: 20
    }).expect(404);
});

it('returns a 401 status if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${id}`).send({
        title: 'aslkdfj',
        price: 20
    }).expect(401);
});

it('returns a 401 status if the user does not own the ticket', async () => {
    const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({
        title: 'asldkfj',
        price: 20
    });

    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', global.signin()).send({
        title: 'alskdjflskjdf',
        price: 1000
    }).expect(401);
});

it('returns a 400 status if the user provides an invalid title or price', async () => {
    const cookie = global.signin();

    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'asldkfj',
        price: 20
    });

    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: '',
        price: 20
    }).expect(400);

    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: 'alskdfjj',
        price: -10
    }).expect(400);
});

it('updates the ticket provided valid inputs', async () => {
    const cookie = global.signin();
    const newTitle = 'new title';
    const newPrice = 100;

    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'asldkfj',
        price: 20
    });

    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: newTitle,
        price: newPrice
    }).expect(200);

    const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send();

    expect(ticketResponse.body.title).toEqual(newTitle);
    expect(ticketResponse.body.price).toEqual(newPrice);
});

it('publishes an event', async () => {
    const cookie = global.signin();
    const newTitle = 'new title';
    const newPrice = 100;

    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'asldkfj',
        price: 20
    });

    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: newTitle,
        price: newPrice
    }).expect(200);

    expect(stanWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();
    const newTitle = 'new title';
    const newPrice = 100;

    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'asldkfj',
        price: 20
    });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: newTitle,
        price: newPrice
    }).expect(400);
});