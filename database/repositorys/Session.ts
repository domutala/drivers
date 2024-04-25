import { Session } from "database/entitys/Session";
import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SessionRepository extends Repository<Session> {
  constructor(dataSource: DataSource) {
    super(Session, dataSource.createEntityManager());
  }

  async _create(publicKey: string) {
    const session = new Session();
    session.publicKey = publicKey;

    await session.save();
    return session;
  }

  async _findOne(params: { [x: string]: any }) {
    if (
      Object.values(params)
        .map((v) => v !== undefined)
        .includes(false)
    ) {
      return;
    }

    const sessions = await this._find(params);

    return sessions[0];
  }

  async _find(params: { [x: string]: any } = {}) {
    const queryBuilder = this.createQueryBuilder("session");

    if (params.id) queryBuilder.andWhere(`session.id = '${params.id}'`);

    return await queryBuilder.getMany();
  }

  async _update(_session: Partial<Session>) {
    const session = await this._findOne({ id: _session.id });
    if (!session) throw "session.update.not_found";

    session.user = _session.user || session.user;
    session.lastUseAt = _session.lastUseAt || session.lastUseAt;
    session.state = _session.state || session.state;

    await session.save();
    return session;
  }
}
