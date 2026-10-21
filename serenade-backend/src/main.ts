import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (process.env.MEETING_WEB_ORIGIN || 'https://serenade-singers.onrender.com,http://localhost:3000').split(',').map(s => s.trim()),
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
