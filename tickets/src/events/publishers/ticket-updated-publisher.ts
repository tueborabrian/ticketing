import { Publisher, Subjects, TicketUpdatedEvent } from '@tuebora/gittix-common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}