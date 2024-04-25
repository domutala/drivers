import { Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { User } from "database/entitys/User";
import { UserRepository } from "database/repositorys/User";
import { Request } from "express";

@Injectable()
export class UserService {
  constructor(
    @Inject(REQUEST) private request: Request,
    private userRepository: UserRepository,
  ) {}

  async password(params: { passwords: [string, string] }) {
    const user = await this.userRepository._password(
      this.request.session.user,
      params.passwords,
    );

    delete user.passwords;
    return user;
  }
}
