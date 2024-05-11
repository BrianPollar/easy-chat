import { faker } from '@faker-js/faker';
import Onlinepeer from '../src/defines/peer.define';
import Chatroom from '../src/defines/chat-room.define';
import Onlineroom from '../src/defines/online-room.define';
import { Socket } from 'socket.io';
import { IpeerInfo } from '../lib/easy-chat';

// Creates a mock chatroom.
// The `cb` callback function is called when the chatroom is created.
export const createMockChatroom = (cb) => {
  // Creates a new chatroom with a random UUID and username.
  return new Chatroom(faker.string.uuid(), faker.internet.userName(), cb);
};

// Creates a mock chatrooms.
//
// The `length` parameter specifies the number of chatrooms to create.
//
// The `cb` callback function is called when each chatroom is created.
export const createMockChatrooms = (length: number, cb) => {
  // Creates an array of `length` chatrooms.
  return Array.from({ length }).map(() => createMockChatroom(cb));
};


export const createMockOnlineroom = (roomStatusInterval: number) => {
  return new Onlineroom(faker.string.uuid(), roomStatusInterval);
};

export const createMockOnlinerooms = (length: number, roomStatusInterval: number) => {
  return Array.from({ length }).map(() => createMockOnlineroom(roomStatusInterval));
};

export const createMockRoomBase = () => {
  return {
    id: faker.string.uuid()
  };
};

export const createMockPeer = (socket: Socket, room: Chatroom | Onlineroom) => {
  return new Onlinepeer(
    faker.string.uuid(),
    socket,
    room
  );
};

export const createMockPeers = (length: number, socket: Socket, room: Chatroom | Onlineroom) => {
  return Array.from({ length }).map(() => createMockPeer(socket, room));
};

export const createMockPeerinfo = (incrementor = 0) => {
  return {
    id: faker.string.uuid(),
    photo: faker.image.avatar(),
    name: faker.name.firstName(),
    roomAdmin: Boolean(incrementor % 2),
    online: Boolean(incrementor % 2),
    unviewedMsgsLength: incrementor
  } as IpeerInfo;
};

export const createMockPeerinfos = (length = 2) => {
  return Array.from({ length }).map((val, index) => createMockPeerinfo(index));
};
