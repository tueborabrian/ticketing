import { stanWrapper } from './stan-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
    console.log('Starting...');
    if (!process.env.STAN_CLIENT_ID) {
        throw new Error('STAN_CLIENT_ID must be defined');
    }

    if (!process.env.STAN_URL) {
        throw new Error('STAN_URL must be defined');
    }

    if (!process.env.STAN_CLUSTER_ID) {
        throw new Error('STAN_CLUSTER_ID must be defined')
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
    } catch (err) {
        console.error(err);
    }
};

start();