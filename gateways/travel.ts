import { Inject } from "@nestjs/common";
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { SessionService } from "services/session";
import { TravelService } from "services/travel";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class TravelGateway implements OnGatewayInit {
  constructor() {}

  @WebSocketServer()
  server: Server;

  @Inject() private readonly service: TravelService;

  afterInit() {
    this.service.server = this.server;
  }

  @SubscribeMessage("travel:init")
  async init(client: Socket, data: any) {
    return await this.service.init(client, data);
  }

  @SubscribeMessage("travel:search-driver")
  async findDriver(client: Socket, data: any) {
    return await this.service.findDriver(client, data);
  }

  @SubscribeMessage("travel:accept")
  async accept(client: Socket, data: any) {
    return await this.service.accept(client, data);
  }

  @SubscribeMessage("travel:accept-driver")
  async acceptDriver(client: Socket, data: any) {
    return await this.service.acceptDriver(client, data);
  }

  @SubscribeMessage("travel:define-route")
  async defineRoute(client: Socket, data: any) {
    return await this.service.defineRoute(client, data);
  }
}
