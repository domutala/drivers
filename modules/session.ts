import { Global, Module } from "@nestjs/common";
import { SessionRepository } from "database/repositorys/Session";
import { UserRepository } from "database/repositorys/User";
import { SessionGateway } from "gateways/session";
import { SessionService } from "services/session";

@Global()
@Module({
  controllers: [],
  imports: [],
  providers: [
    SessionGateway,
    UserRepository,
    SessionRepository,
    SessionService,
  ],
  exports: [SessionRepository, SessionService, SessionGateway],
})
export class SessionModule {}
