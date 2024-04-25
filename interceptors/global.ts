// socket-interceptor.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Socket } from "socket.io";

@Injectable()
export class SocketInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    console.log("oki****************");

    // const client: Socket = context.switchToSocket().getClient();
    // // Faites ce que vous voulez avec le socket client ici
    // console.log("Socket ID:", client.id);
    // console.log("Socket Rooms:", client.rooms);

    return next.handle();
  }
}
