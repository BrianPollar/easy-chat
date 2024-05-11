import { Subject } from 'rxjs';
import { ChatMsg, ChatRoom } from '../defines/chat-room.define';
import { IpeerInfo } from '../../../chat-shared/interfaces/chat.interface';
import { TchatMsgStatus } from '../../../chat-shared/types/union.types';
import { LoggerController } from './logger.controller';
import { EasyChatClient } from '../websocket';
/** Handle CHAT related Task*/
/**
 * Represents a controller for the EasyChat application.
 */
export declare class EasyChatController {
    websocket: EasyChatClient;
    private myId;
    private myNames;
    private myPhotoUrl;
    messages: ChatMsg[];
    toPeer: string;
    activeRoom: ChatRoom | null;
    destroyed$: Subject<unknown>;
    logger: LoggerController;
    /**
     * Creates an instance of the ChatController class.
     * @param websocket - The EasyChatClient instance.
     * @param myId - The ID of the user.
     * @param myNames - The name of the user.
     * @param myPhotoUrl - The URL of the user's photo.
     */
    constructor(websocket: EasyChatClient, myId: string, myNames: string, myPhotoUrl: string, chatElementId: string);
    /**
     * Determines the local peer information.
     * @returns {IpeerInfo} The local peer information.
     */
    determinLocalPeerInfo(): IpeerInfo;
    /**
     * Joins the active room and adds new peers to the chat.
     *
     * @returns {Promise<void>} A promise that resolves when the room is joined.
     */
    joinRoom(): Promise<void>;
    /**
     * Joins the main chat room.
     *
     * @returns {Promise<void>} A promise that resolves when the main room is joined.
     */
    joinMainRoom(): Promise<void>;
    /**
     * Joins the main chat room.
     *
     * @param params - The parameters for joining the chat room.
     * @returns An object containing information about the joined peers and whether the join was successful.
     */
    joinMain(params: any): Promise<{
        peers: IpeerInfo[];
        joined: boolean;
    }>;
    /**
     * Joins the chat room with the specified parameters.
     * @param params - The parameters for joining the chat room.
     * @returns A promise that resolves to an object containing information about the joined peers and whether the join was successful.
     */
    join(params: any): Promise<{
        peers: IpeerInfo[];
        joined: boolean;
    }>;
    /**
     * Sends a chat message.
     *
     * @param chatMessage The message to send.
     * @returns A promise that resolves when the message is sent successfully, or rejects with an error if sending fails.
     */
    send(chatMessage: string, chatElementId: string): Promise<void>;
    /**
     * Updates the status of a chat message.
     *
     * @param status - The new status of the chat message.
     * @param msg - The chat message to update.
     * @returns A promise that resolves to true if the status update was successful, or false otherwise.
     */
    updateStatus(status: TchatMsgStatus, msg: ChatMsg): Promise<boolean>;
    /**
     * Deletes or restores a message.
     * @param id - The ID of the message to delete or restore.
     * @param deleted - A boolean indicating whether to delete or restore the message.
     * @returns A promise that resolves to true if the request is successful, or false if it fails.
     */
    deleteRestoreMesage(id: string, deleted: boolean): Promise<boolean>;
    /**
     * Sends a request to close the peer.
     *
     * @param stopClass A boolean indicating whether to stop the class.
     * @returns A promise that resolves when the request is sent.
     */
    sendClosePeer(stopClass: boolean): Promise<unknown>;
    /**
     * Updates the peer information.
     * @param peerInfo - The updated peer information.
     * @returns A Promise that resolves when the request is sent.
     */
    updatePeer(peerInfo: IpeerInfo): Promise<unknown>;
    /**
     * Updates the room with the given data.
     * @param roomData - The data of the room to update.
     * @param add - A boolean indicating whether to add the room to the array or remove it if false.
     * @returns A Promise that resolves when the update request is sent.
     */
    /** add to array or remove if false */
    updateRoom(roomData: any, add: boolean /** add to array or remove if false */): Promise<unknown>;
    /**
     * Creates a new chat room.
     *
     * @param room - The chat room to be created.
     * @returns A Promise that resolves when the request to create the room is sent.
     */
    newRoom(room: ChatRoom): Promise<unknown>;
    /**
     * Clears the active room and removes all messages.
     */
    clearRoom(): void;
    /**
     * Scrolls to the last message in the chat.
     */
    scrollToLast(chatElementId: string): void;
    /**
     * Destroys the chat controller.
     */
    destroy(): void;
    /**
     * Manages new main peers by adding them to the active users list and triggering a user online change event.
     * @param peers - An array of peer information.
     */
    private mangeNewMainPeers;
    /**
     * Manages the leave event of the main peer.
     * @param {any} data - The data associated with the leave event.
     */
    private manageMainPeerLeave;
    /**
     * Adds a new peer to the active room.
     * If the peer already exists, it updates the online status.
     * @param data - The partial information of the peer.
     */
    private newPeer;
    /**
     * Handles the event when a peer is closed.
     * Updates the online status of the peer to false.
     * @param {string} peerId - The ID of the peer that is closed.
     */
    private peerClosed;
    /**
     * Retrieves the peer information based on the provided peer ID.
     * @param peerId The ID of the peer.
     * @returns The peer information if found, otherwise undefined.
     */
    private getPeerInfo;
    /**
     * Runs the subscriptions for the chat controller.
     * Subscribes to the chat events and performs corresponding actions based on the event type.
     */
    private runSubscriptions;
}
