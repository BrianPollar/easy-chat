/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { EasyChatServer } from '../../src/websocket';
import * as http from 'http';
import * as https from 'https';
import express, { Application } from 'express';
import { Socket } from 'socket.io';
import { initEasyChat } from '../../../chat-client/src/websocket';
import { faker } from '@faker-js/faker/locale/en';
import { IsocketConfig } from '../../src/easy-chat';
import { createMockOnlineroom } from '../mocks';

const expressMock = {
  listen: vi.fn()
} as Partial<express>;

const httpServerMock = {
  address: vi.fn().mockImplementation(() => ({
    port: 4000
  }))
};

const socketMock = {
  handshake: {
    address: 'svava',
    query: {
      userId: 'dhdj'
    }
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


export const constructClient = (
  url: string,
  userId: string,
  userNames: string,
  userPhotoUrl: string
) => {
  return initEasyChat(url, userId, userNames, userPhotoUrl);
};

export const constructSocketServer = (
  port = 4000,
  roomStatusInterval = 100
) => {
  const app: Application = expressMock;
  app.listen(port);
  const httpServer = http.createServer(app);
  const socketConfig: IsocketConfig = {
    pingTimeout: 3000,
    pingInterval: 5000,
    transports: ['websocket'],
    allowUpgrades: false
  };
  const easyChat = new EasyChatServer(httpServer, roomStatusInterval, socketConfig);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const url = 'http://localhost/' + (httpServerMock.address()).port;
  const { easyChatClient, easyChatController } = constructClient(url, faker.string.uuid(), faker.internet.userName(), faker.image.avatar());
  return { easyChat, app, httpServerMock, easyChatClient, easyChatController };
};

describe('Websocket', () => {
  let instance: EasyChatServer;
  const roomStatusInterval = 100;
  let httpsServer: https.Server | http.Server;
  const socketConfig: Partial<IsocketConfig> = {
    pingTimeout: 3000,
    pingInterval: 5000,
    transports: ['websocket'],
    allowUpgrades: false
  };

  beforeEach(() => {
    instance = new EasyChatServer(httpsServer, roomStatusInterval, socketConfig);
    instance.emitEvent = vi.fn().mockImplementation(() => EasyChatServer.prototype.emitEvent);
  });

  it('its real instance of EasyChatServer', () => {
    expect(instance).toBeInstanceOf(EasyChatServer);
    expect(instance.io).toBeUndefined();
    expectTypeOf(instance.io).toBeObject();
  });

  it('should have properties undefined', () => {
    expect(instance.onlineRoom).toBeUndefined();
  });

  it('should run wb socket server', () => {
    instance.run(['/']);
    expect(instance.io).toBeDefined();
  });

  it('#emitEvent should call onlineroom emit', () => {
    const onlineRoom = createMockOnlineroom(10000);
    // @ts-ignore
    instance.onlineRoom = null;
    instance.onlineRoom = onlineRoom;
    vi.spyOn(onlineRoom, 'emit').mockImplementation(() => vi.fn() as any);
    instance.emitEvent('test', {});
    expect(instance.onlineRoom).toStrictEqual(onlineRoom);
    expect(instance.onlineRoom.emit).toBeDefined();
    // expect(instance.onlineRoom.emit).toHaveBeenCalled(); // TODO take of event tersting from here on
  });

  it('shouldn fail to handle connection if no userId', () => {
    socketMock.handshake.query.userId = '';
    const spy = vi.spyOn(socketMock, 'disconnect');
    instance.handleMainConnection(socketMock);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should create a new online room if there is no room def', () => {
    // @ts-ignore
    instance.onlineRoom = null;
    vi.spyOn(instance, 'handleMainConnection');
    instance.handleMainConnection(socketMock);
    expect(instance.onlineRoom).toBeDefined();
  });

  /* it('should create peer if no peer', () => {
    const onlineRoom = createMockOnlineroom(10000);
    instance.onlineRoom = onlineRoom;
    const spy = vi.spyOn(onlineRoom, 'getPeer');
    instance.handleMainConnection(socketMock);
    expect(spy).toHaveBeenCalled();
  });*/

  it('should handle a peer reconnect', () => {
    const socketConfig: IsocketConfig = {
      pingTimeout: 3000,
      pingInterval: 5000,
      transports: ['websocket'],
      allowUpgrades: false
    };
    const easyChat = new EasyChatServer(httpsServer, 1000, socketConfig);
    const socket = {
      handshake: {
        query: {
          userId: 'test-user'
        }
      }
    };
    const handleMainConnectionSpy = vi.spyOn(easyChat, 'handleMainConnection');

    easyChat.handleMainConnection(socketMock);
    expect(handleMainConnectionSpy).toHaveBeenCalled();
  });
});
