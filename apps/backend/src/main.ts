import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS를 정적 파일보다 먼저 등록한다.
  // 순서가 반대면 업로드된 원고와 미리보기가 CORS 헤더 없이 나가서,
  // 개발 환경(프론트 5173 / 백엔드 3001)에서 브라우저가 읽지 못한다.
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  
  app.useStaticAssets(join(process.cwd(), 'client'), {
    prefix: '/',
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
