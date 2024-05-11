/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi, expect, describe, beforeEach, it } from 'vitest';
import { Socket } from 'socket.io';
import { EasyChatServer } from '../../src/websocket';
import * as http from 'http';
import { IsocketConfig } from '../../src/easy-chat';
import Onlineroom from '../../src/defines/online-room.define';
import { createMockOnlineroom } from '../mocks';

const httpServerMock = {

} as http.Server;

const socketConfigMock = {
  pingTimeout: 3000,
  pingInterval: 5000,
  transports: ['websocket'],
  allowUpgrades: false
} as Partial<IsocketConfig>;

const socketMock = {
  handshake: {
    query: ''
  },
  disconnect: vi.fn()
} as unknown as Socket;

const roomMock = {

} as Onlineroom;

describe('EasyChat', () => {
  let instance: EasyChatServer;

  beforeEach(() => {
    instance = new EasyChatServer(
      httpServerMock,
      100,
      socketConfigMock
    );
  });

  it('should be a real instance EasyChat', () => {
    expect(instance).toBeInstanceOf(EasyChatServer);
  });

  it('should have a constructor', () => {
    expect(instance.constructor).toBeDefined();
  });

  it('#method should have properties undefined', () => {
    expect(instance.onlineRoom).toBeUndefined();
    expect(instance.io).toBeUndefined();
  });

  it('#emitEvent should emit event from rooms and peers', () => {
    instance.onlineRoom = createMockOnlineroom(1000);
    const emitSpy = vi.spyOn(instance.onlineRoom, 'emit');
    instance.emitEvent('event', 'data');
    expect(emitSpy).toHaveBeenCalledWith('event', 'data');
  });
});

