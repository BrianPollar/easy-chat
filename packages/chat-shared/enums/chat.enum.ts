/**
 * Enum representing different chat methods.
 */
export enum ECHATMETHOD {
  /**
   * Indicates a new peer has joined the chat.
   */
  NEW_PEER = 'newPeer',

  /**
   * Indicates a new main peer has joined the chat.
   */
  NEW_MAIN_PEER = 'newMainPeer',

  /**
   * Indicates a peer has closed.
   */
  PEER_CLOSE = 'peerClosed',

  /**
   * Indicates the main peer has closed.
   */
  MAIN_PEER_CLOSE = 'mainPeerClosed',

  /**
   * Indicates a join action.
   */
  JOIN = 'join',

  /**
   * Indicates a close peer action.
   */
  CLOSE_PEER = 'closePeer',

  /**
   * Indicates a request to get messages.
   */
  GET_MESSAGES = 'getMessages',

  /**
   * Indicates a chat message.
   */
  CHAT_MESSAGE = 'chatMessage',

  /**
   * Indicates a request to delete a message.
   */
  DELETE_MESSAGE = 'deleteMessage',

  /**
   * Indicates a request to update a room.
   */
  UPDATE_ROOM = 'updateRoom',

  /**
   * Indicates a request to delete a room.
   */
  DELETE_ROOM = 'deleteRoom',

  /**
   * Indicates a request to update the status.
   */
  UPDATE_STATUS = 'updateStatus',

  /**
   * Indicates an update to a peer.
   */
  PEER_UPDATE = 'updatePeer',

  /**
   * Indicates that the socket is connected.
   */
  SOCKET_CONNECTED = 'socketConnected',

  /**
   * Indicates that the socket is disconnected.
   */
  SOCKET_DISCONNECTED = 'socketDisconnected',

  /**
   * Indicates a new room has been created.
   */
  NEW_ROOM = 'newRoom',

  /**
   * Indicates that a room has been created.
   */
  ROOM_CREATED = 'roomCreated',

  /**
   * Indicates an update to the rooms on a new action.
   */
  UPDATE_ROOMS_ON_NEW = 'updateRoomOnNew'
}
