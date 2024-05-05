import { HttpModule } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { FyleRepository } from "database/repositorys/Fyle";
import { TravelRepository } from "database/repositorys/Travel";
import { UserRepository } from "database/repositorys/User";
import { TravelGateway } from "gateways/travel";
import { TravelService } from "services/travel";

@Global()
@Module({
  controllers: [],
  imports: [HttpModule],
  providers: [TravelGateway, TravelRepository, TravelService, FyleRepository],
  exports: [TravelRepository, TravelService, TravelGateway],
})
export class TravelModule { }
