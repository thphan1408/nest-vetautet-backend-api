import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MyLogger } from './logger/my.logger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.useLogger(new MyLogger(AppModule.name));
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Vé tàu tết - API')
    .setDescription('API documentation for Vé tàu tết')
    .setVersion('1.0')
    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //     in: 'header',
    //     name: 'Authorization',
    //     description: 'Enter your Bearer token',
    //   },
    //   'bearerAuth',
    // )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors({
    credentials: true,
    origin: true,
  });

  app.useStaticAssets(__dirname + '/../uploads', { prefix: '/uploads' });

  await app.listen(process.env.PORT || 8080);
  Logger.log(`Server is running on port: ${process.env.PORT || 8080}`);
  Logger.log(`Swagger docs available at: http://localhost:${process.env.PORT || 8080}/api/docs`);
}
bootstrap();
