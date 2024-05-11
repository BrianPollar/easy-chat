import { BehaviorSubject } from 'rxjs';
import { ECHATMETHOD } from '../../../chat-shared/enums/chat.enum';

// This interface defines the properties of a chat event.
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
  data?;
  /**
   * The error message associated with the chat event.
   */
  error?: string;
}

// This interface defines the properties of an out event.
/**
 * Represents an outgoing event.
 */
export interface IoutEvent {
  /**
   * The type of the out event.
   */
  type: string; // TODO this needs union
  /**
   * The data associated with the out event.
   */
  data?;
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
  data?;

  /**
   * The error associated with the event, if any.
   */
  error?;
}

// This class defines the event bus controller.
/**
 * Represents the EventbusController class that handles event bus functionality.
 */
export class EventbusController {
  /**
   * The socket observable.
   */
  socket$: BehaviorSubject<IsocketEvent> = new BehaviorSubject<IsocketEvent>(null);

  /**
   * The chat event observable.
   */
  chat$: BehaviorSubject<IchatEvent> = new BehaviorSubject<IchatEvent>(null);

  /**
   * The user online change observable.
   */
  userOnlineChange$: BehaviorSubject<boolean> = new BehaviorSubject(null);

  /**
   * The out event observable.
   */
  outEvent: BehaviorSubject<IoutEvent> = new BehaviorSubject(null);

  /**
   * Constructs an instance of the EventbusController class.
   */
  constructor() { }
}
