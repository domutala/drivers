import { Inject, Injectable, Logger } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { TravelRepository } from "database/repositorys/Travel";
import { Request } from "express";
import { Server, Socket } from "socket.io";
import verify from "utils/verify";
import mapbox from "utils/mapbox";
import * as turf from "@turf/turf";

@Injectable()
export class TravelService {
  constructor(@Inject(REQUEST) private request: Request) {}

  @Inject() private repository: TravelRepository;

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

  async init(client: Socket, data: { [x: string]: any }) {
    if (
      !verify.isNumber(data.distance) ||
      !verify.isNumber(data.time) ||
      !verify.isLatLng(data.from) ||
      !verify.isLatLng(data.to)
    ) {
      throw "travel.init.invalid_data";
    }

    const travel = await this.repository._init(data);

    return travel;
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

  async accept(client: Socket, data: any) {
    if (
      !verify.isNumber(data.offer.price) ||
      !verify.isNumber(data.offer.distance) ||
      !verify.isNumber(data.offer.time)
    ) {
      throw "travel.accept.invalid_data";
    }

    const travel = await this.repository._accept(data);
    const offer = travel.accepts[travel.accepts.length - 1];

    client.join(offer.id);
    this.server.to(travel.id).emit("travel:accept", offer);

    return travel;
  }

  async acceptDriver(client: Socket, data: { id: string; offer: string }) {
    const { travel, i } = await this.repository._acceptDriver(data);

    this.server.to(travel.accepts[i].id).emit("travel:accept-driver", travel);

    return travel;
  }
}
