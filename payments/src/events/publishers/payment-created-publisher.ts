import { Subjects, Publisher, PaymentCreatedEvent } from '@tuebora/gittix-common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}