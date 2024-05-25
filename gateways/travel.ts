import { Inject } from "@nestjs/common";
import { CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import * as cron from "node-cron";
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
  @WebSocketServer()
  server: Server;

  @Inject() private readonly service: TravelService;
  @Inject() private schedulerRegistry: SchedulerRegistry;

  afterInit() {
    this.service.server = this.server;

    cron.schedule(CronExpression.EVERY_30_SECONDS, this.service.clean);
    this.service.clean();
  }

  @SubscribeMessage("travel/define-route")
  async defineRoute(client: Socket, data: any) {
    return await this.service.defineRoute(client, data);
  }

  @SubscribeMessage("travel/search-driver")
  async searchDriver(client: Socket, data: any) {
    return await this.service.searchDriver(client, data);
  }

  @SubscribeMessage("travel:search-traveller")
  async searchTraveller(client: Socket, data: any) {
    return await this.service.searchTraveller(client, data);
  }

  /** Un driver accepte le voyage  */
  @SubscribeMessage("travel:driver-accept")
  async accept(client: Socket, data: any) {
    return await this.service.driverAccept(client, data);
  }

  @SubscribeMessage("travel:traveller-accept-driver")
  async travellerAcceptDriver(client: Socket, data: any) {
    return await this.service.travellerAcceptDriver(client, data);
  }

  @SubscribeMessage("travel:traveller:get-travels")
  async travellerGetTravels(client: Socket, data: any) {
    return await this.service.travellerGetTravels(client, data);
  }

  // ***************

  @SubscribeMessage("travel:search-driver-old")
  async findDriver(client: Socket, data: any) {
    return await this.service.findDriver(client, data);
  }

  @SubscribeMessage("travel:init")
  async init(client: Socket, data: any) {
    return await this.service.init(client, data);
  }
}
