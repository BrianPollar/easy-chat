// This file imports the `ECHATMETHOD` enum from the `chat.enum` file.
import { ECHATMETHOD } from '../enums/chat.enum';

/**
 * Represents the status of a chat message.
 * Possible values are:
 * - 'sent': The message has been successfully sent.
 * - 'pending': The message is pending and has not been sent yet.
 * - 'failed': The message failed to send.
 * - 'received': The message has been received by the recipient.
 * - 'viewed': The message has been viewed by the recipient.
 */
export type TchatMsgStatus =
  'sent' |
  'pending' |
  'failed' |
  'recieved' |
  'viewed';

/**
 * Represents the possible values for the sender of a chat message.
 */
export type TchatMsgWho =
  'me' |
  'partner';

// This type defines the possible events that can be emitted by a chat room.
/**
 * Represents a room event.
 * @typedef {ECHATMETHOD} TroomEvent
 */
export type TroomEvent = ECHATMETHOD;

/**
 * Represents the possible options for generating a random string.
 */
export type Tmkrandomstringhow =
  'numbers' |
  'letters' |
  'combined';
