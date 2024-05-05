import { Travel } from "database/entitys/Travel";
import { DataSource, Repository } from "typeorm";
import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import verify from "utils/verify";
import { HttpService } from "@nestjs/axios";
import * as fetch from "node-fetch";

@Injectable()
export class TravelRepository extends Repository<Travel> {
  constructor(dataSource: DataSource) {
    super(Travel, dataSource.createEntityManager());
  }

  @Inject() private readonly httpService: HttpService;

  async _create(data: Partial<Travel>) {
    const travel = new Travel();
    travel.step = "search_driver";
    travel.distance = data.distance;
    travel.duration = data.duration;
    travel.price = data.price;
    travel.from = data.from;
    travel.to = data.to;
    travel.capture = data.capture;

    await travel.save();

    return travel;
  }



  async _update(data: Partial<Travel>) {
    const travel = await this._findOne({ id: data.id });
    if (!travel) throw "travel.update.travel_not_found";


    const items = [
      "step",
      "from",
      "to",
      "distance",
      "duration",
      "priced",
      "capture",
      "time",
      "price",
    ]

    for (const item of items) travel[item] = data[item]

    await travel.save();

    return travel;
  }


  async _findDriver(data: Partial<Travel>) {
    const travel = await this._findOne({ id: data.id });
    if (!travel) throw "travel.findDriver.travel_not_found";

    travel.step = "search_driver";
    travel.price = data.price;
    travel.distance = data.distance;
    // travel.time = data.time;
    travel.from = data.from;
    travel.to = data.to;

    await travel.save();

    return travel;
  }

  async _acceptDriver(data: { id: string; offer: string }) {
    const travel = await this._findOne({ id: data.id });
    if (!travel) throw "travel.acceptDriver.travel_not_found";

    travel.step = "await_driver";

    const i = travel.accepts.findIndex((v) => v.id === data.offer);
    if (i === -1) throw "travel.acceptDriver.offer_not_found";
    travel.accepts[i].accepted = true;

    await travel.save();

    return { travel, i };
  }

  async _findOne(params: { [x: string]: any }) {
    if (
      Object.values(params)
        .map((v) => v !== undefined)
        .includes(false)
    ) {
      return;
    }

    const travels = await this._find(params);

    return travels[0];
  }

  async _find(params: { [x: string]: any } = {}) {
    const queryBuilder = this.createQueryBuilder("travel");

    if (params.id) {
      params.ids ||= [];
      params.ids.push(params.id);
    }
    if (params.ids) {
      queryBuilder.andWhere(
        `travel.id IN (${params.ids.map((id: string) => `'${id}'`).join(",")})`,
      );
    }


    if (params.step) {
      params.steps ||= [];
      params.steps.push(params.step);
    }

    if (params.steps) {
      queryBuilder.andWhere(
        `travel.step IN (${params.steps.map((step: string) => `'${step}'`).join(",")})`,
      );
    }

    const travels = await queryBuilder.getMany();

    return travels;
  }

  async _remove(id: string) {
    if (!(await this._findOne({ id }))) throw "travel.remove.not_found";
    await this.delete({ id });
  }
}
