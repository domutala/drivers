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

  async _init(data: Partial<Travel>) {
    let travel: Travel;
    if (data.id) travel = await this._findOne({ id: data.id });
    if (!travel) travel = new Travel();

    travel.step = "define_route";
    travel.distance = data.distance;
    travel.time = data.time;
    travel.from = data.from;
    travel.to = data.to;

    try {
      const toUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${travel.to.lat}&lon=${travel.to.lng}&format=json&apiKey=${process.env.API_GEOAPIFY_KEY}`;
      const toPlace = await (await fetch(toUrl)).json();
      travel.to.name = toPlace.results[0].address_line1;

      const fromUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${travel.from.lat}&lon=${travel.from.lng}&format=json&apiKey=${process.env.API_GEOAPIFY_KEY}`;
      const fromPlace = await (await fetch(fromUrl, {})).json();
      travel.from.name = fromPlace.results[0].address_line1;
    } catch (error) {
      throw error;
    }

    const distanceInKilometers = data.distance / 1000;
    travel.price = Math.round(5 * distanceInKilometers);
    if (verify.isNumber(data.price)) travel.price = data.price;

    await travel.save();

    return travel;
  }

  async _findDriver(data: Partial<Travel>) {
    const travel = await this._findOne({ id: data.id });
    if (!travel) throw "travel.findDriver.travel_not_found";

    travel.step = "search_driver";
    travel.price = data.price;
    travel.distance = data.distance;
    travel.time = data.time;
    travel.from = data.from;
    travel.to = data.to;

    await travel.save();

    return travel;
  }

  async _accept(data: {
    id: string;
    offer: {
      price: number;
      distance: string;
      time: string;
      position: { lat: number; lng: number };
    };
  }) {
    const travel = await this._findOne({ id: data.id });
    if (!travel) throw "travel.accept.travel_not_found";

    travel.accepts.push({
      price: data.offer.price,
      distance: data.offer.distance,
      time: data.offer.time,
      position: data.offer.position,
      id: uuidv4() as string,
      date: new Date(),
    });
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

    const travels = await queryBuilder.getMany();

    return travels;
  }

  async _remove(id: string) {
    if (!(await this._findOne({ id }))) throw "travel.remove.not_found";
    await this.delete({ id });
  }
}
