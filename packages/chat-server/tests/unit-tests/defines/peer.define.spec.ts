/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi, expect, describe, beforeEach, it } from 'vitest';
import Onlinepeer from '../../../src/defines/peer.define';
import { Socket } from 'socket.io';
import { faker } from '@faker-js/faker';
import Onlineroom from '../../../src/defines/online-room.define';

const socketMock = {
  handshake: {
    address: 'svava'
  },
  on: vi.fn(),
  leave: vi.fn(),
  disconnect: vi.fn(),
  join: vi.fn()
} as unknown as Socket;

const roomMock = {
  setupSocketHandler: vi.fn()
} as unknown as Onlineroom;

describe('Onlinepeer', () => {
  let instance: Onlinepeer;
  /* const callBacFn = (...args) => {

  };*/

  beforeEach(() => {
    instance = new Onlinepeer(
      faker.string.uuid(),
      socketMock,
      roomMock
    );
  });

  it('should be a real instance Onlinepeer', () => {
    expect(instance).toBeInstanceOf(Onlinepeer);
  });

  it('should have properties as expected', () => {
    expect(instance.joined).toBeDefined();
    expect(instance.address).toBeDefined();
    expect(instance.closed).toBeDefined();
    expect(instance.disconnectCheck).toBeDefined();
    expect(instance.intervalHandler).toBeUndefined();
    expect(instance.enterTime).toBeDefined();
    expect(instance.lastSeen).toBeDefined();
    expect(instance.id).toBeDefined();
    expect(instance.socket).toBeDefined();
    expect(instance.room).toBeDefined();
  });

  it('#close should close peer', () => {
    // @ts-ignore
    const closeResourceSpy = vi.spyOn(instance, 'closeResource');
    instance.close();
    expect(instance.closed).toBe(true);
    expect(closeResourceSpy).toHaveBeenCalled();
  });

  it('#leaveRoom should leave room', () => {
    vi.spyOn(instance, 'emit');
    // @ts-ignore
    const closeResourceSpy = vi.spyOn(instance, 'closeResource');
    instance.leaveRoom();
    expect(instance.closed).toBe(true);
    // @ts-ignore
    expect(closeResourceSpy).toHaveBeenCalled();
  });

  it('#handlePeerReconnect should handle peer reconnect', () => {
    // @ts-ignore
    const handlePeerSpy = vi.spyOn(instance, 'handlePeer');
    // @ts-ignore
    instance.handlePeerReconnect(socketMock);
    expect(handlePeerSpy).toHaveBeenCalled();
  });

  it('#handlePeer should handle peer connections', () => {
    instance.handlePeer();
  });

  it('#checkClose should check if peer is closed', () => {
    const checkCloseSpy = vi.spyOn(instance, 'checkClose');
    instance.checkClose();
    expect(checkCloseSpy).toHaveBeenCalled();
  });

  it('#peerInfo should return peer info', () => {
    const peerInfo = instance.peerInfo();
    expect(peerInfo.id).toBeDefined();
    expect(peerInfo.durationTime).toBeDefined();
  });
});

describe('OnlinepeerExtras', () => {
  let instance: Onlinepeer;
  const socketMock = {
    handshake: {
      address: 'svava'
    },
    on: vi.fn(),
    leave: vi.fn(),
    disconnect: vi.fn(),
    join: vi.fn()
  } as unknown as Socket;

  const roomMock = {
    setupSocketHandler: vi.fn()
  } as unknown as Onlineroom;

  beforeEach(() => {
    instance = new Onlinepeer(
      faker.string.uuid(),
      socketMock,
      roomMock
    );
  });

  it('should initialize properties correctly', () => {
    expect(instance.joined).toBe(false);
    expect(instance.address).toBe('svava');
    expect(instance.closed).toBe(false);
    expect(instance.disconnectCheck).toBe(0);
    expect(instance.intervalHandler).toBeUndefined();
    expect(instance.enterTime).toBeDefined();
    expect(instance.lastSeen).toBeInstanceOf(Date);
    expect(instance.id).toBeDefined();
    expect(instance.socket).toBe(socketMock);
    expect(instance.room).toBe(roomMock);
  });

  it('#close should close peer', () => {
    vi.spyOn(instance, 'emit');
    // @ts-ignore
    const closeResourceSpy = vi.spyOn(instance, 'closeResource');
    instance.close();
    expect(instance.closed).toBe(true);
    expect(instance.lastSeen).toBeInstanceOf(Date);
    expect(closeResourceSpy).toHaveBeenCalled();
    expect(socketMock.disconnect).toHaveBeenCalledWith(true);
    // expect(clearInterval).toHaveBeenCalledWith(instance.intervalHandler); // direct watch no spy
    expect(instance.emit).toHaveBeenCalledWith('mainclose');
  });

  it('#leaveRoom should leave room', () => {
    vi.spyOn(instance, 'emit');
    // @ts-ignore
    const closeResourceSpy = vi.spyOn(instance, 'closeResource');
    // expect(instance.emit).toHaveBeenCalledWith('close');
    instance.leaveRoom();
    expect(instance.closed).toBe(true);
    expect(closeResourceSpy).toHaveBeenCalled();
    expect(socketMock.leave).toHaveBeenCalledWith(instance.room.id);
    expect(instance.emit).toHaveBeenCalledWith('close');
  });

  it('#handlePeerReconnect should handle peer reconnect', () => {
    const handlePeerSpy = vi.spyOn(instance, 'handlePeer');
    instance.handlePeerReconnect(socketMock);
    expect(socketMock.leave).toHaveBeenCalledWith(instance.room.id);
    expect(handlePeerSpy).toHaveBeenCalled();
  });

  it('#handlePeer should listen to socket events', () => {
    instance.handlePeer();
    expect(socketMock.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socketMock.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('#checkClose should check if peer is closed', () => {
    instance.socket.connected = false;
    instance.checkClose();
    expect(instance.disconnectCheck).toBe(1);
    expect(instance.intervalHandler).toBeFalsy();

    instance.socket.connected = true;
    instance.checkClose();
    expect(instance.disconnectCheck).toBeTruthy();
    expect(instance.intervalHandler).toBeNull();

    instance.disconnectCheck = 7;
    const closeSpy = vi.spyOn(instance, 'close');
    instance.checkClose();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('#peerInfo should return peer info', () => {
    const peerInfo = instance.peerInfo();
    expect(peerInfo.id).toBe(instance.id);
    expect(peerInfo.address).toBe(instance.address);
    expect(peerInfo.durationTime).toBeCloseTo((Date.now() - instance.enterTime) / 1000, 2);
  });
});
