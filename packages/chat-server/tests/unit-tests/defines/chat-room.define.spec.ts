/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi, expect, describe, beforeEach, it } from 'vitest';
import Chatroom from '../../../src/defines/chat-room.define';
import { faker } from '@faker-js/faker';
import { Socket } from 'socket.io';
import { createMockChatroom, createMockPeer, createMockPeerinfo } from '../../mocks';
import { ECHATMETHOD } from '../../../lib/easy-chat';

const socketMock = {
  handshake: {
    address: 'svava'
  },
  on: vi.fn(),
  leave: vi.fn(),
  disconnect: vi.fn(),
  join: vi.fn(),
  broadcast: {
    to: vi.fn().mockImplementation(() => ({
      emit: vi.fn()
    }))
  }
} as unknown as Socket;

describe('Chatroom', () => {
  // const timeoutTick = 5000;
  let callbackArgs: string | symbol[];
  let callbackEventArgs: string | symbol[];
  const callBacFn = vi.fn().mockImplementation((...args)=> {
    // return (...args) => {
    callbackArgs = args;
    // };
  });

  const callBackEventFn = vi.fn().mockImplementation((...args) => {
    // return (...args) => {
    callbackEventArgs = args;
    // };
  });

  let instance: Chatroom;

  beforeEach(() => {
    instance = createMockChatroom(callBackEventFn);
  });

  it('its real instance of Chatroom', () => {
    expect(instance).toBeInstanceOf(Chatroom);
  });

  it('should have props as expeccted', () => {
    // @ts-ignore
    expect(instance.bornTime).toBeDefined();
    // @ts-ignore
    expect(instance.reqString).toBeDefined();
    // @ts-ignore
    expect(instance.notifString).toBeDefined();
    // @ts-ignore
    expect(typeof instance.bornTime).toBe('number');
    // @ts-ignore
    expect(instance.reqString).toBe('mainrequest');
    // @ts-ignore
    expect(instance.notifString).toBe('mainnotification');
    expect(instance.id).toBeDefined();
    expect(instance.userId).toBeDefined();
    // @ts-ignore
    expect(instance.cb).toBeDefined();
  });

  it('#create static should create an instance of Chatroom', () => new Promise(done => {
    const roomId = faker.string.uuid();
    const userId = faker.string.uuid();
    const callBacFn = vi.fn().mockImplementation(()=> {
      return (...args) => {};
    });
    const room = Chatroom.create(roomId, userId, callBacFn);
    expect(room).toBeInstanceOf(Chatroom);
    done(null);
  }));

  it('#nowhandleSocketRequest should make JOIN room request', async() => {
    const request = {
      method: ECHATMETHOD.JOIN,
      data: { }
    };
    const peer = createMockPeer(socketMock, instance);
    const joinReq = await instance
      .nowhandleSocketRequest(peer, request, callBacFn);
    expect(joinReq).toHaveProperty('success');
    expect(joinReq.success).toBe(true);
    expect(peer.joined).toBe(true);
  });

  it('#nowhandleSocketRequest should make close peer request', async() => {
    const request = {
      method: ECHATMETHOD.CLOSE_PEER,
      data: { }
    };
    const peer = createMockPeer(socketMock, instance);
    const closePeerReq = await instance.nowhandleSocketRequest(peer, request, callBacFn);
    expect(closePeerReq).toHaveProperty('success');
    expect(closePeerReq.success).toBe(true);
    expect(peer.joined).toBe(false);
    expect(callBacFn).toHaveBeenCalled();
  });

  it('#nowhandleSocketRequest should make chat message send request', async() => {
    const request = {
      method: ECHATMETHOD.CHAT_MESSAGE,
      data: {
        id: faker.string.uuid(),
        chatMessage: faker.string.alphanumeric(),
        createTime: new Date(),
        to: 'all',
        whoType: '',
        roomId: instance.id
      }
    };
    const peer = createMockPeer(socketMock, instance);
    const sendMsgReq = await instance
      .nowhandleSocketRequest(peer, request, callBacFn);
    expect(sendMsgReq).toHaveProperty('success');
    expect(sendMsgReq.success).toBe(true);
    expect(peer.joined).toBe(false);
    expect(callBacFn).toHaveBeenCalled();
    expect(callBackEventFn).toHaveBeenCalled();
    expect(callbackEventArgs).toBeDefined();
    expect(callbackEventArgs[0]).toBe(ECHATMETHOD.CHAT_MESSAGE);
    expect(callbackEventArgs[1]).toHaveProperty('id');
  });

  it('#nowhandleSocketRequest should make delete message request', async() => {
    const request = {
      method: ECHATMETHOD.DELETE_MESSAGE,
      data: {
        to: 'all',
        deleted: true,
        id: faker.string.uuid()
      }
    };
    const peer = createMockPeer(socketMock, instance);
    const deleteMsgReq = await instance.nowhandleSocketRequest(peer, request, callBacFn);
    expect(deleteMsgReq).toHaveProperty('success');
    expect(deleteMsgReq.success).toBe(true);
    expect(callBacFn).toHaveBeenCalled();
    expect(callBackEventFn).toHaveBeenCalled();
    expect(callbackEventArgs).toBeDefined();
    expect(callbackEventArgs[0]).toBe(ECHATMETHOD.DELETE_MESSAGE);
    expect(callbackEventArgs[1]).toHaveProperty('id');
    expect(callbackEventArgs[1]).toHaveProperty('to');
    expect(callbackEventArgs[1]).toHaveProperty('deleted');
  });

  it('#nowhandleSocketRequest should make update room request', async() => {
    const request = {
      method: ECHATMETHOD.UPDATE_ROOM,
      data: {
        to: 'all',
        roomData: instance,
        add: false
      }
    };
    const peer = createMockPeer(socketMock, instance);
    const updateRoomReq = await instance
      .nowhandleSocketRequest(peer, request, callBacFn);
    expect(updateRoomReq).toHaveProperty('success');
    expect(updateRoomReq.success).toBe(true);
    expect(callBacFn).toHaveBeenCalled();
    expect(callBackEventFn).toHaveBeenCalled();
    expect(callbackArgs).toBeDefined();
    expect(callbackEventArgs[0]).toBe(ECHATMETHOD.UPDATE_ROOM);
    expect(callbackEventArgs[1]).toHaveProperty('to');
    expect(callbackEventArgs[1]).toHaveProperty('roomData');
    expect(callbackEventArgs[1]).toHaveProperty('add');
  });

  it('#nowhandleSocketRequest should make delete room request', async() => {
    const request = {
      method: ECHATMETHOD.DELETE_ROOM,
      data: {
        to: 'all'
      }
    };
    const peer = createMockPeer(socketMock, instance);
    const deleteRoomReq = await instance
      .nowhandleSocketRequest(peer, request, callBacFn);
    expect(deleteRoomReq).toHaveProperty('success');
    expect(deleteRoomReq.success).toBe(true);
    expect(peer.joined).toBe(false);
    expect(callBacFn).toHaveBeenCalled();
  });

  it('#nowhandleSocketRequest should make update peer request', async() => {
    const request = {
      method: ECHATMETHOD.PEER_UPDATE,
      data: {
        to: 'all',
        peerInfo: createMockPeerinfo()
      }
    };
    const peer = createMockPeer(socketMock, instance);
    const updatePeerReq = await instance
      .nowhandleSocketRequest(peer, request, callBacFn);
    expect(updatePeerReq).toHaveProperty('success');
    expect(updatePeerReq.success).toBe(true);
    expect(peer.joined).toBe(false);
    expect(callBacFn).toHaveBeenCalled();
    expect(callBackEventFn).toHaveBeenCalled();
    expect(callbackEventArgs).toBeDefined();
    expect(callbackEventArgs[0]).toBe(ECHATMETHOD.PEER_UPDATE);
    expect(callbackEventArgs[1]).toHaveProperty('to');
    expect(callbackEventArgs[1]).toHaveProperty('peerInfo');
  });

  it('#emitEvent should call the callback function', () => {
    // @ts-ignore
    const peer = createMockPeerinfo();
    // @ts-ignore
    instance.emitEvent(ECHATMETHOD.NEW_PEER, peer);
    expect(callBackEventFn).toHaveBeenCalled();
    expect(callbackEventArgs).toBeDefined();
    expect(callbackEventArgs[0]).toBe(ECHATMETHOD.NEW_PEER);
    expect(callbackEventArgs[1]).toEqual(peer);
  });
});


