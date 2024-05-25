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
    user.phonenumber = params.phonenumber;

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

    if (params.phonenumber) {
      params.phonenumbers ||= [];
      params.phonenumbers.push(params.phonenumber);
    }
    if (params.phonenumbers) {
      queryBuilder.andWhere(
        `user.phonenumber IN (${params.phonenumbers
          .map((phonenumber: string) => `'${phonenumber}'`)
          .join(",")})`,
      );
    }

    const users = await queryBuilder.getMany();

    return users;
  }

  async _updateDetails(params: { [x: string]: any }) {
    const user = await this._findOne({ id: params.id });
    if (!user) throw "user.update.user_not_found";

    if (params.name !== undefined && typeof params.name !== "string") {
      throw "user.update.name_invalid";
    }

    user.details.name = params.name || user.details.name;

    await user.save();

    return user;
  }

  async _updatePreferences(params: { [x: string]: any }) {
    const user = await this._findOne({ id: params.id });
    if (!user) throw "user.update.user_not_found";

    user.preferences ||= {} as any;

    if (params.lang !== undefined) {
      if (!["fr", "en"].includes(params.lang)) {
        throw "user.update.preferences.lang_invalid";
      }

      user.preferences.lang = params.lang;
    }

    if (params.mode !== undefined) {
      if (![null, "dark", "light"].includes(params.mode)) {
        throw "user.update.preferences.mode_invalid";
      }

      user.preferences.mode = params.mode;
    }

    await user.save();
    return user;
  }

  async _remove(id: string) {
    if (!(await this._findOne({ id }))) throw "user.remove.user_not_found";
    await this.delete({ id });
  }
}
