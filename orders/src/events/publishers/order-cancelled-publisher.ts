import { Publisher, OrderCancelledEvent, Subjects } from '@tuebora/gittix-common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}