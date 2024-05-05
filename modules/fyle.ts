import { HttpModule } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { FyleController } from "controllers/fyle";
import { FyleRepository } from "database/repositorys/Fyle";
import { FyleService } from "services/fyle";

@Global()
@Module({
  controllers: [FyleController],
  imports: [HttpModule],
  providers: [FyleRepository, FyleService],
  exports: [FyleRepository, FyleService],
})
export class FyleModule { }
