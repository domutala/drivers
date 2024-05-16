import { Global, Module } from "@nestjs/common";
import { UserRepository } from "database/repositorys/User";
import { UserGateway } from "gateways/user";
import { UserService } from "services/user";

@Global()
@Module({
  controllers: [],
  imports: [],
  providers: [UserGateway, UserRepository, UserService],
  exports: [UserRepository, UserService, UserGateway],
})
export class UserModule {}
