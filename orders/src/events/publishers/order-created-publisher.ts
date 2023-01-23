import { Publisher, OrderCreatedEvent, Subjects } from '@tuebora/gittix-common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}