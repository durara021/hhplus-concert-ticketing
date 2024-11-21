import { Test, TestingModule } from '@nestjs/testing';
import { Controller, INestApplication, Injectable, Module, OnModuleInit, Inject } from '@nestjs/common';
import { ClientKafka, ClientsModule, EventPattern, Payload, Transport } from '@nestjs/microservices';

@Controller()
export class TestKafkaController {
  public receivedMessages: any[] = []; // 메시지 저장 배열

  @EventPattern('test-topic') // Kafka 토픽 구독
  async handleKafkaMessage(@Payload() message: any) {
    console.log('Message received in TestKafkaController:', message);
    this.receivedMessages.push(message); // 메시지 저장
  }
}

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async sendMessage(topic: string, message: any) {
    await this.kafkaClient.emit(topic, message);
    console.log(`Message sent to topic "${topic}":`, message);
  }
}

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'nestjs-kafka-test-client',
            brokers: ['localhost:9094'],
          },
          consumer: {
            groupId: 'nestjs-consumer-group-test',
          },
        },
      },
    ]),
  ],
  controllers: [TestKafkaController],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaTestModule {}

describe('Kafka Integration Test', () => {
  let app: INestApplication;
  let kafkaProducerService: KafkaProducerService;
  let testKafkaController: TestKafkaController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [KafkaTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    kafkaProducerService = moduleFixture.get<KafkaProducerService>(KafkaProducerService);
    testKafkaController = moduleFixture.get<TestKafkaController>(TestKafkaController);

    // 마이크로서비스 연결
    app.connectMicroservice({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'nestjs-kafka-test-client',
          brokers: ['localhost:9094'],
        },
        consumer: {
          groupId: 'nestjs-consumer-group-test',
        },
      },
    });

    // 마이크로서비스 시작
    await app.startAllMicroservices();
    await app.init();

    // KafkaProducerService의 onModuleInit 호출
    await kafkaProducerService.onModuleInit();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should send and receive a Kafka message using the TestKafkaController', async () => {
    const testMessage = { key: 'value', value: 'Hello Kafka!' };

    // 컨슈머가 준비될 때까지 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 메시지 발행
    await kafkaProducerService.sendMessage('test-topic', testMessage);

    // 메시지 처리 대기
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 컨트롤러의 메시지 수신 여부 확인
    expect(testKafkaController.receivedMessages).toHaveLength(1);
    expect(testKafkaController.receivedMessages[0]).toEqual(testMessage.value);
  });
});
