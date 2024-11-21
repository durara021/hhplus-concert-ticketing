import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Swagger 설정
  const config = new DocumentBuilder()
  .setTitle('API Documentation') // 문서 제목 설정
  .setDescription('The API description') // 문서 설명
  .setVersion('1.0') // 버전 정보
  .addTag('APIs') // 태그 추가
  .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // '/api-docs' 경로에 Swagger UI 설정

  // Kafka 마이크로서비스 연결
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'nestjs-kafka-client',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'nestjs-consumer-group',
      },
    },
  });

  
  await app.startAllMicroservices();
  // 모든 마이크로서비스 시작
  await app.listen(3000);
}
bootstrap();
