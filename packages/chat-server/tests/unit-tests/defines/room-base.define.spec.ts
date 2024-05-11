/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi, expect, describe, beforeEach, it } from 'vitest';
import { faker } from '@faker-js/faker';
import RoomBase from '../../../src/defines/room-base.define';
import Onlinepeer from '../../../src/defines/peer.define';
import { Socket } from 'socket.io';
import Chatroom from '../../../src/defines/chat-room.define';
import { createMockPeer } from '../../../tests/mocks';
import { ECHATMETHOD } from '../../../../chat-shared/enums/chat.enum';

class BaseTesterBase extends RoomBase {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nowhandleSocketRequest(peer: Onlinepeer, request, cb
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    return Promise.resolve(null);
  }
}

const socketMock = {
  broadcast: {
    to: vi.fn().mockImplementation(() => ({
      emit: vi.fn()
    }))
  },
  emit: vi.fn(),
  handshake: {
    address: ''
  },
  on: vi.fn(),
  disconnect: vi.fn()
} as unknown as Socket;

const peerMock = {
  id: faker.string.uuid(),
  socket: {
    on: vi.fn(),
    join: vi.fn(),
    handshake: {
      address: 'addr'
    }
  },
  on: vi.fn(),
  close: vi.fn()
} as unknown as Onlinepeer;

describe('RoomBase', () => {
  let instance: BaseTesterBase;
  const id = faker.string.uuid();
  /* const callBacFn = (...args) => {

  };*/

  beforeEach(() => {
    instance = new BaseTesterBase(id);
  });

  it('should be a real instance BaseTesterBase', () => {
    expect(instance).toBeInstanceOf(BaseTesterBase);
  });

  it('should have properties defined', () => {
    expect(instance.peers).toBeDefined();
    expect(instance.rooms).toBeDefined();
    expect(instance.closed).toBeDefined();
    expect(instance.activeTime).toBeDefined();
    // @ts-ignore
    expect(instance.bornTime).toBeDefined();
    // @ts-ignore
    expect(instance.reqString).toBeDefined();
    // @ts-ignore
    expect(instance.notifString).toBeDefined();
    expect(instance.id).toBeDefined();
  });

  it('#setupSocketHandler should set up socket handler', () => {
    const onSpy = vi.spyOn(peerMock.socket, 'on');// .mockImplementationOnce(() => undefined);
    instance.setupSocketHandler(peerMock);
    expect(onSpy).toHaveBeenCalled();
  });

  it('#handlePeer should handle peer connection', () => {
    const joinSpy = vi.spyOn(peerMock.socket, 'join');// .mockImplementationOnce(() => undefined);
    const setupSocketHandlerSpy = vi.spyOn(instance, 'setupSocketHandler').mockImplementationOnce(() => undefined);
    const onSpy = vi.spyOn(peerMock, 'on');// .mockImplementationOnce(() => undefined);
    instance.handlePeer(peerMock);
    expect(joinSpy).toHaveBeenCalled();
    expect(setupSocketHandlerSpy).toHaveBeenCalled();
    expect(onSpy).toHaveBeenCalled();
  });

  it('#getPeer should get peer provided peer id', () => {
    const valPeer = createMockPeer(socketMock, instance as unknown as Chatroom);
    instance.peers.set(valPeer.id, valPeer);
    const peer = instance.getPeer(valPeer.id);
    expect(peer).toBeInstanceOf(Onlinepeer);
    expect(peer).toHaveProperty('id');
  });

  it('#close should close a room', () => {
    const closeSpy = vi.spyOn(instance, 'close').mockImplementationOnce(() => undefined);
    // const emitSpy = vi.spyOn(instance, 'emit').mockImplementationOnce(() => undefined);
    const valPeer = createMockPeer(socketMock, instance as unknown as Chatroom);
    instance.peers.set(valPeer.id, valPeer);
    // const peer =
    instance.getPeer(valPeer.id);
    instance.close();
    // @ts-ignore
    expect(closeSpy).toHaveBeenCalled();
    // expect(emitSpy).toHaveBeenCalled();
  });

  it('#checkDeserted should check if room is empty', () => {
    // @ts-ignore
    const checkEmptySpy = vi.spyOn(instance, 'checkEmpty');
    const closeSpy = vi.spyOn(instance, 'close');
    instance.checkDeserted();
    expect(checkEmptySpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('#statusReport should get detailed status about room', () => {
    const report = instance.statusReport();
    expect(report).toBeDefined();
    expect(report).toHaveProperty('id');
    expect(report).toHaveProperty('peers');
    expect(report).toHaveProperty('duration');
    expect(report).toHaveProperty('lastActive');
  });

  it('#sendMsgToallpeers should dispatch notification to any user online', () => {
    // @ts-ignore
    const nownotificationSpy = vi.spyOn(instance, 'nownotification');
    instance.peers.set(peerMock.id, peerMock);
    instance.sendMsgToallpeers(id, ECHATMETHOD.CHAT_MESSAGE, { data: null });
    expect(nownotificationSpy).toBeDefined();
  });

  it('#setActive should set date for room to current date', () => {
    // @ts-ignore
    instance.setActive();
    expect(instance.activeTime).toBeDefined();
  });

  it('#checkEmpty should check if room is empty', () => {
    // @ts-ignore
    const isEmpty = instance.checkEmpty();
    expect(typeof isEmpty).toBe('boolean');
  });

  it('#checkEmpty should return run true if peers are empty', () => {
    instance.peers.clear();
    // @ts-ignore
    const isEmpty = instance.checkEmpty();
    expect(typeof isEmpty).toBe('boolean');
    expect(isEmpty).toBe(true);
  });

  it('#checkEmpty should return true if peers are not empty', () => {
    const peer = createMockPeer(socketMock, instance as unknown as Chatroom);
    instance.peers.set('peer.id', peer);
    // @ts-ignore
    const isEmpty = instance.checkEmpty();
    expect(typeof isEmpty).toBe('boolean');
    expect(isEmpty).toBe(false);
  });

  it('#nowhandleSocketRequest should return null for mock method', async() => {
    const reqRes = await instance.nowhandleSocketRequest(peerMock, 'any', 'any');
    expect(reqRes).toBeNull();
  });
});

describe('RoomBaseExtras', () => {
  let instance: RoomBase;
  const id = 'test-room-id';

  beforeEach(() => {
    // @ts-ignore
    instance = new RoomBase(id);
  });

  it('should be a real instance of RoomBase', () => {
    expect(instance).toBeInstanceOf(RoomBase);
  });

  it('should have properties defined', () => {
    expect(instance.peers).toBeDefined();
    expect(instance.rooms).toBeDefined();
    expect(instance.closed).toBeDefined();
    expect(instance.activeTime).toBeDefined();
    // @ts-ignore
    expect(instance.bornTime).toBeDefined();
    // @ts-ignore
    expect(instance.reqString).toBeDefined();
    // @ts-ignore
    expect(instance.notifString).toBeDefined();
    expect(instance.id).toBe(id);
  });

  it('#setupSocketHandler should set up socket handler', () => {
    const peerMock = {
      socket: {
        on: vi.fn()
      }
    } as unknown as Onlinepeer;

    instance.setupSocketHandler(peerMock);

    // @ts-ignore
    expect(peerMock.socket.on).toHaveBeenCalledWith(instance.reqString, expect.any(Function));
  });

  it('#handlePeer should handle peer connection', () => {
    const peerMock = {
      id: 'test-peer-id',
      socket: {
        on: vi.fn(),
        join: vi.fn(),
        handshake: {
          address: 'addr'
        }
      },
      on: vi.fn(),
      close: vi.fn()
    } as unknown as Onlinepeer;

    instance.handlePeer(peerMock);

    expect(peerMock.socket.join).toHaveBeenCalledWith(instance.id);
    expect(peerMock.on).toHaveBeenCalledWith('close', expect.any(Function));
    expect(peerMock.on).toHaveBeenCalledWith('mainclose', expect.any(Function));
  });

  it('#getPeer should get peer by ID', () => {
    const peerId = 'test-peer-id';
    const peerMock = {
      id: peerId
    } as unknown as Onlinepeer;

    instance.peers.set(peerId, peerMock);

    const peer = instance.getPeer(peerId);

    expect(peer).toBe(peerMock);
  });

  it('#close should close the room', () => {
    const peerMock = {
      closed: false,
      close: vi.fn()
    } as unknown as Onlinepeer;

    instance.peers.set('test-peer-id', peerMock);

    instance.close();

    expect(peerMock.close).toHaveBeenCalled();
    expect(instance.closed).toBe(true);
    expect(instance.peers.size).toBe(0);
    // expect(instance.emit).toHaveBeenCalledWith('close');
  });

  it('#checkDeserted should close the room if it is empty or inactive', () => {
    // @ts-ignore
    const emptyRoomSpy = vi.spyOn(instance, 'checkEmpty').mockReturnValue(true);
    const closeSpy = vi.spyOn(instance, 'close');

    instance.checkDeserted();

    expect(emptyRoomSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();

    emptyRoomSpy.mockReturnValue(false);
    instance.activeTime = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago

    instance.checkDeserted();

    expect(emptyRoomSpy).toHaveBeenCalled();
    // expect(closeSpy).toHaveBeenCalledTimes(2);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('#statusReport should return the status of the room', () => {
    // @ts-ignore
    const dura = Math.floor((Date.now() - instance.bornTime) / 1000);
    const lastActive = Math.floor((Date.now() - instance.activeTime) / 1000);

    const report = instance.statusReport();

    expect(report).toEqual({
      id: instance.id,
      peers: [],
      duration: dura,
      lastActive
    });
  });

  it('should broadcast the notification to the socket when broadcast is false', () => {
    const socketMock = {
      emit: vi.fn()
    } as unknown as Socket;

    const method = 'test-method';
    const data = { message: 'Hello, world!' };

    // @ts-ignore
    instance.nownotification(socketMock, method, data, false);

    // @ts-ignore
    expect(socketMock.emit).toHaveBeenCalledWith(instance.notifString, { method, data });
  });

  it('should broadcast the notification to all sockets in the room when broadcast is true', () => {
    const socketMock = {
      broadcast: {
        to: vi.fn().mockReturnThis(),
        emit: vi.fn()
      }
    } as unknown as Socket;

    const method = 'test-method';
    const data = { message: 'Hello, world!' };

    // @ts-ignore
    instance.nownotification(socketMock, method, data, true);

    expect(socketMock.broadcast.to).toHaveBeenCalledWith(instance.id);
    // @ts-ignore
    expect(socketMock.broadcast.emit).toHaveBeenCalledWith(instance.notifString, { method, data });
  });

  it('#setActive should set the active time to the current time', () => {
    const currentTime = Date.now();
    vi.spyOn(global.Date, 'now').mockReturnValue(currentTime);

    // @ts-ignore
    instance.setActive();

    expect(instance.activeTime).toBe(currentTime);
  });

  it('#checkEmpty should return true if the room has no peers', () => {
    instance.peers.clear();

    // @ts-ignore
    const isEmpty = instance.checkEmpty();

    expect(isEmpty).toBe(true);
  });

  it('#checkEmpty should return false if the room has at least one peer', () => {
    instance.peers.set('test-peer-id', {} as unknown as Onlinepeer);

    // @ts-ignore
    const isEmpty = instance.checkEmpty();

    expect(isEmpty).toBe(false);
  });
});
