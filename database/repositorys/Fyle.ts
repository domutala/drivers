import { Fyle } from "database/entitys/Fyle";
import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";

@Injectable()
export class FyleRepository extends Repository<Fyle> {
  constructor(dataSource: DataSource) {
    super(Fyle, dataSource.createEntityManager());
  }

  async _save(params: { type: string, access: string[], data: Buffer }) {
    const fyle = new Fyle();
    fyle.generateId();

    writeFileSync(join(process.cwd(), '_FILES_', `${fyle.id}.${params.type.split('/').pop()}`), params.data)

    fyle.type = params.type;
    fyle.access = params.access;

    await fyle.save();
    return fyle;
  }

  async _findOne(params: { [x: string]: any }) {
    if (
      Object.values(params)
        .map((v) => v !== undefined)
        .includes(false)
    ) {
      return;
    }

    const fyles = await this._find(params);

    return fyles[0];
  }

  async _find(params: { [x: string]: any } = {}) {
    const queryBuilder = this.createQueryBuilder("fyle");

    if (params.id) queryBuilder.andWhere(`fyle.id = '${params.id}'`);

    let fyles = await queryBuilder.getMany()
    fyles = fyles.map(fyle => {
      const is = existsSync(join(process.cwd(), '_FILES_', `${fyle.id}.${fyle.type.split('/').pop()}`))

      if (is) return fyle
      return undefined
    }).filter((fyle) => fyle)

    return fyles;
  }
}
