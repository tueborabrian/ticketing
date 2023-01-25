import mongoose from 'mongoose';
import { app } from './app';
import { stanWrapper } from './stan-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
    console.log('Starting...');
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    if (!process.env.STAN_CLIENT_ID) {
        throw new Error('STAN_CLIENT_ID must be defined');
    }

    if (!process.env.STAN_URL) {
        throw new Error('STAN_URL must be defined');
    }

    if (!process.env.STAN_CLUSTER_ID) {
        throw new Error('STAN_CLUSTER_ID must be defined');
    }

    if (!process.env.STRIPE_KEY) {
        throw new Error('STRIPE_KEY must be defined');
    }

    try {
        await stanWrapper.connect(process.env.STAN_CLUSTER_ID, process.env.STAN_CLIENT_ID, process.env.STAN_URL);
        stanWrapper.client.on('close', () => {
            console.log('STAN connection closed!');
            process.exit();
        });
        process.on('SIGINT', () => stanWrapper.client.close());
        process.on('SIGTERM', () => stanWrapper.client.close());

        new OrderCreatedListener(stanWrapper.client).listen();
        new OrderCancelledListener(stanWrapper.client).listen();
        
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDb');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000!');
    });
};

start();