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
  constructor() {}

  @WebSocketServer()
  server: Server;

  @Inject() private readonly service: SessionService;

  afterInit() {
    this.service.server = this.server;
  }

  @SubscribeMessage("session/init")
  async init(client: Socket, data: any) {
    return await this.service.init(client, data);
  }

  @SubscribeMessage("session/login")
  async login(client: Socket, data: any) {
    return await this.service.login(client, data);
  }

  @SubscribeMessage("session/logout")
  async logout(client: Socket) {
    return await this.service.logout(client);
  }

  @SubscribeMessage("session/resend-code-validation")
  async resendCodeValidation(client: Socket, data: any) {
    return await this.service.resendCodeValidation(client, data);
  }
  @SubscribeMessage("session/validate")
  async validate(client: Socket, data: any) {
    return await this.service.validate(client, data);
  }
}
