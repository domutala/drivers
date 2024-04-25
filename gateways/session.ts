import { Inject } from "@nestjs/common";
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { SessionService } from "services/session";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class SessionGateway implements OnGatewayInit {
  constructor() {} // @Inject() private readonly service: SessionService

  @WebSocketServer()
  server: Server;

  @Inject() private readonly service: SessionService;

  afterInit() {
    this.service.server = this.server;
    this.service.initInterceptor();
  }

  @SubscribeMessage("session-init")
  async init(client: Socket, data: any) {
    return await this.service.init(client, data);
  }

  @SubscribeMessage("session-my-position")
  async myPosition(client: Socket, data: any) {
    return await this.service.myPosition(client, data);
  }
}
