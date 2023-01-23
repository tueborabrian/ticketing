import { Publisher, Subjects, TicketCreatedEvent } from '@tuebora/gittix-common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}