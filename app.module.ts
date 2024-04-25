import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigDatabase } from "database";
import { UserRepository } from "database/repositorys/User";
import { UserService } from "services/user";
import { SessionModule } from "modules/session";
import { TravelModule } from "modules/travel";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({ ...ConfigDatabase(), autoLoadEntities: true }),
    SessionModule,
    TravelModule,
  ],

  controllers: [],

  providers: [UserRepository, UserService],

  exports: [],
})
export class AppModule {}
