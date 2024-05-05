import { Inject, Injectable, Logger } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { FyleRepository } from "database/repositorys/Fyle";
import { Request } from "express";
import { Server } from "socket.io";

@Injectable()
export class FyleService {
  constructor(@Inject(REQUEST) private request: Request) { }

  @Inject() private repository: FyleRepository;

  server: Server;


  async get(params: { [x: string]: any } = {}) {
    return await this.repository._find(params);
  }

  async getOne(params: { [x: string]: any } = {}) {
    return await this.repository._findOne(params);
  }
}
