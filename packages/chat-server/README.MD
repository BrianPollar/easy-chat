README.MD
This file contains the documentation for the chat-server package in the Easy Chat Library.

## @easy-chat/chat-server

This is the documentation for the @easy-chat/chat-server package.
It provides functionality for the chat server in the Easy Chat application.

## Features
@easy-chat/chat-server implements real-time bidirectional event-based communication. It consists of:

- a Node.js server (this repository)
- a [Javascript client library](https://github.com/BrianPollar/@easy-chat/chat-client) for the browser (or a Node.js client)

Its main features are:

#### Reliability

Connections are established even in the presence of:

- proxies and load balancers.
- personal firewall and antivirus software.

For this purpose, it relies on [socket io](https://github.com/socketio), which first establishes connection to the backend server using the best possible transports.

#### Minimalistic chat implementation support

You do not need to understand the internal structures and operation of websockets and chat systems.
All you need to do is call create a room, heck you not need to destroy a room as this is handled intelligently and automatically;

Sample code:

```ts
import { EasyChatServer, IsocketConfig } from "@easy-chat/chat-server";
const httpsServer; // your node server instance
const roomStatusInterval = 1000; // logging update interval
const socketConfig: IsocketConfig = {
  pingTimeout: 3000,
  pingInterval: 5000,
  transports: ["websocket"],
  allowUpgrades: false,
};

const allowedOrigins = ["https://yourwhitelistapi.com"];

const easyChat = new EasyChatServer(httpsServer, roomStatusInterval, socketConfig);
easyChat.run(allowedOrigins);
```

## Installation

```bash
// with npm
npm install @easy-chat/chat-server

// with yarn
yarn add @easy-chat/chat-server
```

## How to use

The following creates an instance of easyChat.

```ts
import { EasyChatServer, IsocketConfig, IchatMsg } from "@easy-chat/chat-server";
const httpsServer; // your node server instance
const roomStatusInterval = 1000; // logging update interval
// the config properties can be optional
const socketConfig: IsocketConfig = {
  pingTimeout: 3000,
  pingInterval: 5000,
  transports: ["websocket"],
  allowUpgrades: false,
};
const easyChat = new EasyChatServer(httpsServer, roomStatusInterval, socketConfig);
easyChat.run();

/**
 * get data from event incase you
 * you want to process it futher,say my be save
 * in database or file*/
easyChat.onlineRoom.on("CHAT_MESSAGE", (message: IchatMsg) => {
  // do stuffs with message here
});

// for full event list see enum ECHATMETHOD
import { ECHATMETHOD } from "@easy-chat/chat-server";
```

### Communication

Communication between you and the server are established throught events
Below are all events you can listen to;

## Save Message

```ts
/**
 * get data from event incase you
 * you want to process it futher,say my be save
 * in database or file*/
easyChat.onlineRoom.on("CHAT_MESSAGE", (message: IchatMsg) => {
  // do stuffs with message here
});
```

## Delete Message

```ts
/**
 * get delted message request and id of the message incase you want to remove from database*/
easyChat.onlineRoom.on(
  "DELETE_MESSAGE",
  ({ deleted, id }: { deleted: IchatMsg; id: string }) => {
    // do stuffs here
  }
);
```

## Update Room

```ts
/**
 * get update room request*/
import { Chatroom } from "@easy-chat/chat-server";
easyChat.onlineRoom.on(
  "UPDATE_ROOM",
  ({ roomData }: { roomData: Chatroom }) => {
    // do stuffs here
  }
);
```

## Update Peer Status

```ts
import { IpeerInfo } from "@easy-chat/chat-server";
/**
 * get update peer request*/
easyChat.onlineRoom.on(
  "PEER_UPDATE",
  ({ peerInfo }: { peerInfo: IpeerInfo }) => {
    // do stuffs here
  }
);
```

### In conjunction with Express

You need to pass the `Server` to `easy-chat`, and not the express application function. The rest of the listening is done automatically.

```ts
import { EasyChatServer, IsocketConfig } from "@easy-chat/chat-server";
import express from "express";
const app = require("express")();
const httpsServer = require("http").createServer(app);
const roomStatusInterval = 1000; // logging update interval
const socketConfig = {
  pingTimeout: 3000,
  pingInterval: 5000,
  transports: ["websocket"],
  allowUpgrades: false,
};
const easyChat = new EasyChatServer(httpsServer, roomStatusInterval, socketConfig);
```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPolar/@easy-chat/chat-server). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
