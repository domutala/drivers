import { User } from "database/entitys/User";
import { DataSource, Repository } from "typeorm";
import { Injectable, Logger } from "@nestjs/common";
import * as randomatic from "randomatic";
import forge from "utils/forge";

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async _add(params: { [key: string]: any }) {
    const user = new User();

    user.username = randomatic("Aa0", 8);

    user.passwords ||= [];
    const password = randomatic("Aa0!", 8);
    user.passwords.push(forge.encrypter(password));

    await user.save();

    if (process.env.NODE_ENV !== "production") {
      Logger.log(`email: \x1b[33m ${user.username}`);
      Logger.log(`password: \x1b[33m ${password}`);
    } else {
      /** TODO: Envoyer par mail l'email et le mot de passe */
    }

    return user;
  }

  async _password(id: string, passwords: [string, string]) {
    const user = await this._findOne({ id });
    if (!user) throw "user.updatePassword.not_found";

    if (passwords[0] !== passwords[1]) {
      throw "user.updatePassword.passwords_not_equal";
    }

    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/;
    if (!regex.test(passwords[0])) {
      throw "user.updatePassword.passwords_not_valid";
    }

    user.passwords.push(forge.encrypter(passwords[0]));

    await user.save();
    return user;
  }

  async _findOne(params: { [x: string]: any }) {
    if (
      Object.values(params)
        .map((v) => v !== undefined)
        .includes(false)
    ) {
      return;
    }

    const users = await this._find(params);

    return users[0];
  }

  async _find(params: { [x: string]: any } = {}) {
    const queryBuilder = this.createQueryBuilder("user");

    if (params.id) {
      params.ids ||= [];
      params.ids.push(params.id);
    }

    if (params.ids) {
      queryBuilder.andWhere(
        `user.id IN (${params.ids.map((id: string) => `'${id}'`).join(",")})`,
      );
    }

    if (params.username) {
      params.usernames ||= [];
      params.usernames.push(params.username);
    }

    if (params.usernames) {
      queryBuilder.andWhere(
        `user.username IN (${params.usernames
          .map((username: string) => `'${username}'`)
          .join(",")})`,
      );
    }

    const users = await queryBuilder.getMany();

    return users;
  }

  async _remove(id: string) {
    if (!(await this._findOne({ id }))) throw "user.remove.not_found";
    await this.delete({ id });
  }
}
