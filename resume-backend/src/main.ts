import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    // cors: {
    //   origin: true,
    //   credentials: true,
    // }
  });
  const config = new DocumentBuilder()
    .setTitle('Resume')
    .setDescription('The Resume API description')
    .setVersion('0.1')
    // .addBasicAuth(
    //   { type: 'http', scheme: 'basic', bearerFormat: 'SignedToken' },
    //   'SignedToken'
    // )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3010);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
