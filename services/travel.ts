import { Inject, Injectable, Logger, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { TravelRepository } from "database/repositorys/Travel";
import { Request } from "express";
import { Server, Socket } from "socket.io";
import verify from "utils/verify";
import mapbox from "utils/mapbox";
import * as turf from "@turf/turf";
import { FyleRepository } from "database/repositorys/Fyle";
import { Travel } from "database/entitys/Travel";
import { v4 as uuidv4 } from "uuid";
import * as dayjs from "dayjs";

@Injectable()
export class TravelService {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Inject() private repository: TravelRepository;
  @Inject() private fyleRepository: FyleRepository;

  server: Server;

  async defineRoute(
    client: Socket,
    data: {
      departure: { lat: number; lng: number };
      destination: { lat: number; lng: number };
    },
  ) {
    const _routes = await mapbox.route(data);
    const routes = [];

    for (const route of _routes.routes) {
      const distanceInKilometers = route.distance / 1000;
      const price = Math.round(5 * distanceInKilometers);

      const line = turf.lineString(route.geometry.coordinates);
      const bbox = turf.bbox(line);

      routes.push({
        geojson: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: route.geometry as [number, number][],
            },
          ],
        },
        meta: {
          coordinates: route.geometry.coordinates as [number, number][],
          distance: route.distance as number,
          duration: route.duration as number,
          price: { amount: price, currency: "MAD" },
          bounds: bbox,
        },
      });
    }

    return routes;
  }

  async searchDriver(client: Socket, data: { [x: string]: any }) {
    const departure = data.from || data.departure;
    const destination = data.to || data.destination;
    const routes = await mapbox.route({ departure, destination });
    const route = routes.routes[0];

    let travel: Travel;
    if (data.id) travel = await this.repository._findOne({ id: data.id });

    if (!travel) {
      travel = await this.repository._create({
        departure: data.departure,
        destination: data.destination,
        distance: route.distance,
        duration: route.duration,
        price: data.price,
        step: "search_driver",
      });
    }

    if (data.price) travel.price = data.price;

    travel = await this.repository._update(travel);
    client.join(travel.id);

    setTimeout(async () => {
      let _travel = await this.repository._findOne({ id: travel.id });
      if (_travel.step === "search_driver") {
        _travel = await this.repository._update({
          id: _travel.id,
          step: "define_route",
        });
        client.emit("travel_await_driver_expired", _travel);
      }
    }, 5000);

    return travel;
  }

  async searchTraveller(client: Socket, data: { [x: string]: any }) {
    const travels = await this.repository._find({ step: "search_driver" });
    return travels;
  }

  async clean() {
    // const travels = await this.repository._find({ steps: ["search_driver"] });
    // for (const travel of travels) {
    //   const diff = dayjs().diff(travel.updatedAt, "seconds");
    //   if (Math.abs(diff) >= 60) {
    //     await this.repository._update({ id: travel.id, step: "cancel" });
    //     this.server.to(travel.id).emit("travel:cancel", travel);
    //   }
    // }
  }

  async travellerGetTravels(client: Socket, data: { [key: string]: any }) {
    const travels = await this.repository._find({});
    return travels;
  }

  async init(client: Socket, data: { [x: string]: any }) {
    if (
      !verify.isNumber(data.distance) ||
      !verify.isNumber(data.time) ||
      !verify.isLatLng(data.from) ||
      !verify.isLatLng(data.to)
    ) {
      throw "travel.init.invalid_data";
    }

    // const travel = await this.repository._init(data);

    return;
  }

  async findDriver(client: Socket, data: { [x: string]: any }) {
    if (
      !verify.isNumber(data.distance) ||
      !verify.isNumber(data.time) ||
      !verify.isNumber(data.price) ||
      !verify.isLatLng(data.from) ||
      !verify.isLatLng(data.to)
    ) {
      throw "travel.foundDriver.invalid_data";
    }

    const travel = await this.repository._findDriver(data);

    client.join(travel.id);
    this.server.sockets.emit("travel:search-driver", data);

    return travel;
  }

  async driverAccept(
    client: Socket,
    data: { id: string; price: number; duration: number },
  ) {
    if (!verify.isNumber(data.price) || !verify.isNumber(data.duration)) {
      throw "travel.accept.invalid_data";
    }

    const travel = await this.repository._findOne({ id: data.id });
    if (!travel) throw "travel.accept.travel_not_found";

    const offer = {
      id: data.id,
      duration: data.duration,
      price: data.price,
      key: uuidv4(),
    };

    client.join(offer.key);
    this.server.to(travel.id).emit("travel:driver-accept", offer);

    return offer;
  }

  async travellerAcceptDriver(
    client: Socket,
    data: { id: string; price: number; key: string },
  ) {
    if (!verify.isNumber(data.price) || !verify.isString(data.key)) {
      throw "travel.acceptDriver.invalid_data";
    }

    let travel = await this.repository._findOne({ id: data.id });
    if (!travel) throw "travel.accept.travel_not_found";

    travel = await this.repository._update({
      id: travel.id,
      step: "await_driver",
      price: { ...travel.price, amount: data.price },
    });

    this.server.to(data.key).emit("travel:traveller-accept-driver", travel);

    return travel;
  }
}
