import { Subjects, Publisher, ExpirationCompleteEvent } from '@tuebora/gittix-common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}