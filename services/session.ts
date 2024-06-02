import { Inject, Injectable, Logger } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { SessionRepository } from "database/repositorys/Session";
import { UserRepository } from "database/repositorys/User";
import { Request } from "express";
import { Server, Socket } from "socket.io";
import * as randomatic from "randomatic";
import forge from "utils/forge";
import { isUUID } from "class-validator";

@Injectable()
export class SessionService {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Inject() private userRepository: UserRepository;
  @Inject() private sessionRepository: SessionRepository;

  server: Server;

  async init(client: Socket, params: { publicKey: string; id: string }) {
    if (!params.publicKey) throw "session.init.publicKey_is_required";
    if (!params.id || !isUUID(params.id)) throw "session.init.id_is_required";

    let id: string;
    if (!client.request.session) {
      const session = await this.sessionRepository._create(params);
      id = session.id;
      client.request.session = session as any;
    } else {
      id = client.request.session.id;
    }
    return {
      id: { _RSA_ENCODED_: id },
      status: client.request.session?.status,
      user: client.request.session?._user,
      publicKey: forge.keys.public,
      details: { country: "sn", available: true },
    };
  }

  async login(client: Socket, params: { phonenumber: string }) {
    if (!client.request.session) {
      throw "session.login.session_is_required";
    }

    // already logged
    if (!client.request.session.user) {
      let user = await this.userRepository._findOne({
        phonenumber: params.phonenumber,
      });

      // créer un nouvel utlisateur
      if (!user) {
        user = await this.userRepository._add({
          phonenumber: params.phonenumber,
        });
      }

      const otp = randomatic("0", 6);
      const optEncrypt = forge.encrypter(otp);

      const session = await this.sessionRepository._update({
        id: client.request.session.id,
        user: user.id,
        status: "tobevalidate",
        validationCode: Array.isArray(optEncrypt) ? optEncrypt : [optEncrypt],
      });

      client.request.session = { ...session, _user: user } as any;

      if (process.env.NODE_ENV !== "production") {
        Logger.log(`otp: ${otp}`);
      }
    }

    return {
      status: client.request.session.status,
      user: client.request.session._user,
    };
  }

  async logout(client: Socket) {
    if (!client.request.session) {
      throw "session.login.session_is_required";
    }

    if (!["expired", "closed"].includes(client.request.session.status)) {
      const session = await this.sessionRepository._findOne({
        id: client.request.session.id,
      });
      if (session) {
        await this.sessionRepository._update({
          id: session.id,
          status: "closed",
        });
      } else {
        throw "session.login.session_not_found";
      }
    }

    return { status: "closed" };
  }

  async resendCodeValidation(client: Socket, params: { phonenumber: string }) {
    if (!client.request.session) {
      throw "session.login.session_is_required";
    }

    if (client.request.session.status !== "tobevalidate") {
      throw "session.login.session_cannot_be_validate";
    }

    const otp = randomatic("0", 6);
    const optEncrypt = forge.encrypter(otp);

    const session = await this.sessionRepository._update({
      id: client.request.session.id,
      validationCode: Array.isArray(optEncrypt) ? optEncrypt : [optEncrypt],
    });

    client.request.session = session as any;

    if (process.env.NODE_ENV !== "production") {
      Logger.log(`otp: ${otp}`);
    }

    return {};
  }

  async validate(client: Socket, params: { code: string }) {
    if (!client.request.session) {
      throw "session.login.validate.session_is_required";
    }

    if (client.request.session.status !== "tobevalidate") {
      throw "session.login.validate.session_cannot_be_validate";
    }

    const optEncrypt = client.request.session.validationCode;
    const otp = forge.decrypter(optEncrypt);
    if (otp !== params.code) throw "session.login.validate.invalid_code";

    const session = await this.sessionRepository._update({
      id: client.request.session.id,
      status: "valid",
    });

    client.request.session = session as any;

    return { status: client.request.session.status };
  }

  async get(params: { [x: string]: any } = {}) {
    return await this.sessionRepository._find(params);
  }
}
