import { IchatMsg, IchatRoom, IpeerInfo } from '../../../chat-shared/interfaces/chat.interface';
import { TchatMsgStatus, TchatMsgWho } from '../../../chat-shared/types/union.types';
/**
 * Represents a chat room.
 */
export declare class Chat {
    /**
     * The ID of the chat room.
     */
    id: string;
    /**
     * The creation time of the chat room.
     */
    createTime: Date;
    /**
     * Creates a new instance of the Chat class.
     * @param data - The data object containing the chat room information.
     */
    constructor(data: IchatRoom | IchatMsg);
}
/**
 * Represents a chat room.
 */
export declare class ChatRoom extends Chat {
    lastActive: Date;
    peers: IpeerInfo[];
    blocked: string[];
    unviewedMsgsLength: number;
    type: string;
    extras?: any;
    closed: boolean;
    /**
     * Creates a new instance of the ChatRoom class.
     * @param room - The required chat room data.
     */
    constructor(room: Required<IchatRoom>);
    /**
     * Updates the chat room with new values.
     * @param val - The new values to update.
     * @param add - Indicates whether to add the new values or replace the existing ones.
     * peers comes in here as string
     */
    update(val: IchatRoom, add: boolean): void;
    /**
     * Gets the participants of the chat room.
     * @returns An array of peer information.
     */
    getParticipants(): IpeerInfo[];
    /**
     * Gets the peer information for the specified ID.
     * @param id - The ID of the peer.
     * @returns The peer information if found, otherwise null.
     */
    getPeerInfo(id: string): IpeerInfo;
}
/**
 * Represents a chat message in a chat room.
 */
export declare class ChatMsg extends Chat {
    private myId;
    peerInfo?: IpeerInfo;
    roomId: string;
    msg: string;
    who: TchatMsgWho;
    status: TchatMsgStatus;
    deleted: boolean;
    /**
     * Creates a new instance of the ChatMsg class.
     * @param myId The ID of the current user.
     * @param msg The chat message data.
     */
    constructor(myId: string, msg: IchatMsg);
}
