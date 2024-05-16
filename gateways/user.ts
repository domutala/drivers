import { Inject } from "@nestjs/common";
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { UserService } from "services/user";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class UserGateway {
  constructor() {}

  @WebSocketServer()
  server: Server;

  @Inject() private readonly service: UserService;

  @SubscribeMessage("user/update-details")
  async updateDetails(client: Socket, data: any) {
    return await this.service.updateDetails(client, data);
  }
}
