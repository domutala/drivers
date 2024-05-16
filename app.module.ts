import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigDatabase } from "database";
import { UserRepository } from "database/repositorys/User";
import { UserService } from "services/user";
import { SessionModule } from "modules/session";
import { TravelModule } from "modules/travel";
import { HttpModule } from "@nestjs/axios";
import { FyleModule } from "modules/fyle";
import { ScheduleModule } from "@nestjs/schedule";
import { UserModule } from "modules/user";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({ ...ConfigDatabase(), autoLoadEntities: true }),
    SessionModule,
    TravelModule,
    FyleModule,
    UserModule,
  ],

  controllers: [],
  exports: [],
})
export class AppModule {}
