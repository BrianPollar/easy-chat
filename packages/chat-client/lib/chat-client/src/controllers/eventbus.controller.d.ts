import { BehaviorSubject } from 'rxjs';
import { ECHATMETHOD } from '../../../chat-shared/enums/chat.enum';
/**
 * Represents a chat event.
 */
export interface IchatEvent {
    /**
     * The type of the chat event.
     */
    type: ECHATMETHOD;
    /**
     * The data associated with the chat event.
     */
    data?: any;
    /**
     * The error message associated with the chat event.
     */
    error?: string;
}
/**
 * Represents an outgoing event.
 */
export interface IoutEvent {
    /**
     * The type of the out event.
     */
    type: string;
    /**
     * The data associated with the out event.
     */
    data?: any;
    /**
     * The error message associated with the out event.
     */
    error?: string;
}
/**
 * Represents a socket event.
 */
export interface IsocketEvent {
    /**
     * The type of the event.
     */
    type: string;
    /**
     * The data associated with the event.
     */
    data?: any;
    /**
     * The error associated with the event, if any.
     */
    error?: any;
}
/**
 * Represents the EventbusController class that handles event bus functionality.
 */
export declare class EventbusController {
    /**
     * The socket observable.
     */
    socket$: BehaviorSubject<IsocketEvent>;
    /**
     * The chat event observable.
     */
    chat$: BehaviorSubject<IchatEvent>;
    /**
     * The user online change observable.
     */
    userOnlineChange$: BehaviorSubject<boolean>;
    /**
     * The out event observable.
     */
    outEvent: BehaviorSubject<IoutEvent>;
    /**
     * Constructs an instance of the EventbusController class.
     */
    constructor();
}
