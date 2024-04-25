import { Inject, Injectable, Logger } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { SessionRepository } from "database/repositorys/Session";
import { UserRepository } from "database/repositorys/User";
import { Request } from "express";
import { Server, Socket } from "socket.io";
import forge from "utils/forge";

@Injectable()
export class SessionService {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Inject() private userRepository: UserRepository;
  @Inject() private sessionRepository: SessionRepository;

  server: Server;

  initInterceptor() {
    this.server.use(async (client, next) => {
      client = await this.decode(client);
      next();
    });
  }

  async init(client: Socket, params: { publicKey: string }) {
    if (!params.publicKey) throw "session.init.publicKey_is_required";
    let id: string;
    if (!client.request.session) {
      const session = await this.sessionRepository._create(params.publicKey);
      id = session.id;
      client.request.session = session as any;
    } else {
      id = client.request.session.id;
    }
    return {
      id: { _RSA_ENCODED_: id },
      publicKey: forge.keys.public,
      user: client.request.session?._user,
      available: true,
      details: {
        country: "ma",
        lang: "fr",
      },
    };
  }

  async myPosition(client: Socket, data: { lat: number; lng: number }) {
    if (typeof data.lat !== "number" || typeof data.lng !== "number") {
      throw "session.myPosition.invalid_data";
    }

    client.request.session.position = data;

    return data;
  }

  async decode(client: Socket) {
    let token = client.request.headers.authorization;

    if (token) {
      token = token.split(" ").pop();
      const session = await this.sessionRepository._findOne({ id: token });

      if (session) {
        client.request.session = session as any;

        if (session.user) {
          client.request.session._user = await this.userRepository._findOne({
            id: session.user,
          });
        }
      }
    }

    return client;
  }

  async get(params: { [x: string]: any } = {}) {
    return await this.sessionRepository._find(params);
  }
}
