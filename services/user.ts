import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "database/repositorys/User";
import { Socket } from "socket.io";

@Injectable()
export class UserService {
  constructor() {}

  @Inject() private repository: UserRepository;

  async updateDetails(socket: Socket, data: { [x: string]: any }) {
    return await this.repository._updateDetails({
      ...data,
      id: socket.request.session.user,
    });
  }

  async updatePreferences(socket: Socket, data: { [x: string]: any }) {
    return await this.repository._updatePreferences({
      ...data,
      id: socket.request.session.user,
    });
  }
}
