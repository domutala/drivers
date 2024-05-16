import { IoAdapter } from "@nestjs/platform-socket.io";
import { isFunction, isNil } from "@nestjs/common/utils/shared.utils";
import { MessageMappingProperties } from "@nestjs/websockets";
import { DISCONNECT_EVENT } from "@nestjs/websockets/constants";
import { fromEvent, Observable, throwError } from "rxjs";
import {
  catchError,
  filter,
  first,
  map,
  mergeMap,
  share,
  takeUntil,
} from "rxjs/operators";
import { Server, ServerOptions, Socket } from "socket.io";
import forge from "utils/forge";
import { HttpException, Inject } from "@nestjs/common";
import { SessionRepository } from "database/repositorys/Session";
import { CreateDatabase } from "database/index";
import { Session } from "database/entitys/Session";
import { User } from "database/entitys/User";

export class SocketAdapter extends IoAdapter {
  decrypter(obj?: { [key: string]: any }) {
    function _decrypter(datas: any) {
      if (!datas) {
        // ne rien faire
      } else if (Array.isArray(datas)) {
        for (let i = 0; i < datas.length; i++) {
          datas[i] = _decrypter(datas[i]);
        }
      } else if (Object.prototype.toString.call(datas) === "[object Object]") {
        if ("_RSA_ENCODED_" in datas) {
          datas = forge.decrypter(datas._RSA_ENCODED_);
        } else {
          for (const key in datas) {
            datas[key] = _decrypter(datas[key]);
          }
        }
      }

      return datas;
    }

    return _decrypter(obj);
  }

  encrypter(client: Socket, obj?: { [key: string]: any }) {
    const _encrypter = (datas: any) => {
      if (!datas) {
        // ne rien faire
      } else if (Array.isArray(datas)) {
        for (let i = 0; i < datas.length; i++) {
          datas[i] = _encrypter(datas[i]);
        }
      } else if (Object.prototype.toString.call(datas) === "[object Object]") {
        if ("_RSA_ENCODED_" in datas) {
          if (client.request.session.publicKey) {
            datas._RSA_ENCODED_ = forge.encrypter(
              datas._RSA_ENCODED_,
              client.request.session.publicKey,
            );
          } else {
            datas._RSA_ENCODED_ = null;
          }
        } else {
          for (const key in datas) {
            datas[key] = _encrypter(datas[key]);
          }
        }
      }

      return datas;
    };

    return _encrypter(obj);
  }

  async decode(token: string) {
    if (token) {
      token = token.split(" ").pop();

      const database = await CreateDatabase();
      const sessionRepository = database.getRepository(Session);
      const userRepository = database.getRepository(User);
      const session = await sessionRepository.findOneBy({ id: token });

      if (session) {
        if (session.user) {
          session._user = await userRepository.findOneBy({
            id: session.user,
          });
        }
      }

      return session;
    }
  }

  createIOServer(port: number, options: ServerOptions): any {
    const io: Server = super.createIOServer(port, {
      ...options,
      cors: { origin: "*" },
    });

    return io;
  }

  async bindMessageHandlers(
    socket: Socket,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ) {
    function sendError(error: any) {
      console.log(error);
      if (error instanceof HttpException) {
        return throwError(new Error(error.message));
      }

      if (typeof error === "string") return throwError(new Error(error));
      return throwError(new Error("internal_error"));
    }

    const disconnect$ = fromEvent(socket, DISCONNECT_EVENT).pipe(
      share(),
      first(),
    );

    handlers.forEach(async ({ message, callback }) => {
      const source$ = fromEvent(socket, message).pipe(
        mergeMap(async (payload: any) => {
          socket.request.session = await this.decode(
            socket.request.headers.authorization,
          );

          return payload;
        }),
        mergeMap((payload: any) => {
          if (socket.request.session) {
            if (["closed", "expired"].includes(socket.request.session.status)) {
              return sendError(`session_is_${socket.request.session.status}`);
            }
          }
          // eslint-disable-next-line prefer-const
          let { data, ack } = this.mapPayload(payload);
          data = this.decrypter(data);

          return transform(callback(data, ack)).pipe(
            catchError(sendError),
            filter((response: any) => !isNil(response)),
            map((response: any) => [response, ack]),
          );
        }),
        takeUntil(disconnect$),
      );

      source$.subscribe(([response, ack]) => {
        if (response instanceof Error) {
          socket.emit("error", response.message);
          return "__ERROR__";
        }

        response = this.encrypter(socket, response);
        if (response.event) return socket.emit(response.event, response.data);

        isFunction(ack) && ack(response);
      });
    });
  }
}
