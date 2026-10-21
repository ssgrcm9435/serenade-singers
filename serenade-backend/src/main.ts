import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && (!process.env.MEETING_AUTH_SECRET || process.env.MEETING_AUTH_SECRET.length < 32)) {
    throw new Error('Production MEETING_AUTH_SECRET is required and must be at least 32 characters');
  }
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (process.env.MEETING_WEB_ORIGIN || 'https://serenade-singers.onrender.com,http://localhost:3000').split(',').map(s => s.trim()),
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
