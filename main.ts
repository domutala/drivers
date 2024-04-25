import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SocketAdapter } from "socket.adapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useWebSocketAdapter(new SocketAdapter(app));

  const port = process.env.API_PORT || 8580;
  await app.listen(port);

  console.log(`listen at http://localhost:${port}`, await app.getUrl());
}
bootstrap();
