import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ReservationRequestEntity, ReservationEntity, OutBoxEntity } from '../infra/entities';
import { AbstractReservationRepository } from './repository.interfaces';
import { AbstractReservationService } from './service.interfaces/reservation.service.interface';
import { ReservationRequestModel } from './models';
import { ReservationResponseCommand } from '../app/commands';
import { InBoxEntity } from '../../reservation/infra/entities/inbox.entity';
import { ClientKafka } from '@nestjs/microservices';
import { AbstractReservationEventRepository } from './repository.interfaces/reservation.eventbox.repository.interface';

@Injectable()
export class ReservationService implements AbstractReservationService{

  constructor(
    private readonly reservationRepository: AbstractReservationRepository,
    private readonly reservationEventRepository: AbstractReservationEventRepository,
    private readonly dataSource: DataSource,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}
/*
  async onModuleInit(): Promise<void> {
    // Kafka Consumer 시작
    await this.kafkaClient.createConsumer('reservation-consumer','payment-topic', async (message) => {
      try {
        async (manager: EntityManager): Promise<void> => {
          const model = ReservationRequestModel.of({ id: parseInt(message.reservationId), }); // JSON 메시지를 모델로 변환

          // 아웃박스 기록
          await this.reservationRepository.saveOutBox(OutBoxEntity.of({
            topic: 'payment-topic',
            payload: JSON.stringify(model),
            status: 'RECEIVE',
            createdAt: new Date(),
            worker: 'RESERVATION',
          }), manager); 
          
          await this.book(model, manager); // `book` 메서드 호출

          // 인박스 기록
          await this.reservationRepository.saveInBox(InBoxEntity.of({
            topic: 'payment-topic',
            payload: JSON.stringify(model),
            status: 'PROCESSED',
            createdAt: new Date(),
            worker: 'RESERVATION',
          }), manager);
          
          console.log(`Successfully processed reservation for: ${model.id}`);
        };
      } catch (error) {
        console.error(`Failed to process reservation:`, error);
      }
    });
  }
*/
  async reserve(model: ReservationRequestModel, manager?: EntityManager): Promise<ReservationResponseCommand> {
    const executeReserve = async (manager: EntityManager): Promise<ReservationResponseCommand> => {
        //예약 확인
        model.updateStatus('available');
        const item = await this.reservationRepository.item(ReservationRequestEntity.of(model), manager);
        
        if(!item) throw new NotFoundException("이미 예약된 아이템입니다.");
        
        //임시 예약
        model.updateStatus('temp');
        model.updateVersion(item.version);
        await this.reservationRepository.reserve(ReservationEntity.of(model), manager)

        return ReservationResponseCommand.of(item);
    }
    return manager ? executeReserve(manager) : this.dataSource.transaction(executeReserve);
  }

  //예약 조회
  async reservation(model: ReservationRequestModel, manager?: EntityManager): Promise<ReservationResponseCommand> {
    const executeReservation = async (manager: EntityManager): Promise<ReservationResponseCommand> => {
      const result = await this.reservationRepository.item(ReservationRequestEntity.of(model), manager);
      if(!result) throw new NotFoundException('예약된 아이템이 존재하지 않습니다.');
      return ReservationResponseCommand.of(result);
    }
    return manager ? executeReservation(manager) : this.dataSource.transaction(executeReservation);
  }
  
  //상태 확정
  async book(model: ReservationRequestModel, manager?: EntityManager): Promise<void> {
    const executeUpdateStatus = async (manager: EntityManager): Promise<void> => {
      const MAX_RETRIES = 3; // 최대 재시도 횟수
      let retryCount = 0; // 현재 재시도 횟수
      try {

        const outBoxEntity: OutBoxEntity = OutBoxEntity.of({
          payload: JSON.stringify(model)
        });
        await this.reservationEventRepository.saveOutBox(outBoxEntity, manager);

        //예약 확인
        model.updateStatus('temp');
        const item = await this.reservationRepository.item(ReservationRequestEntity.of(model), manager);
        
        if(!item) throw new NotFoundException("예약된 아이템이 없습니다..");

        model.updateStatus('confimed');
        const updateResult = await this.reservationRepository.updateStatus(ReservationEntity.of(model), manager);
        if(updateResult < 1 ) throw new InternalServerErrorException("이미 예약 완료된 아이템입니다.");

        const inboxEntity: InBoxEntity = InBoxEntity.of(outBoxEntity);
        inboxEntity.updatePayload(JSON.stringify(model));
        inboxEntity.updateStatus('processed');
        await this.reservationEventRepository.saveInBox(inboxEntity, manager);
      } catch(error) {
        retryCount++;
        console.error(
          `Retry attempt ${retryCount}/${MAX_RETRIES} failed. Error: ${error}`
        );
        if (retryCount === MAX_RETRIES) {
          // 이벤트 발행
          this.kafkaClient.emit(
            'payment.fail',
            {
              eventId: model.eventId,
              userId : model.userId,
            },
          )
        }
      }
    }
    manager ? executeUpdateStatus(manager) : this.dataSource.transaction(executeUpdateStatus);
  }

  // 이력 및 현재 금액 조회
  async rollBack(model: ReservationRequestModel, manager?:EntityManager): Promise<void> {
    const MAX_RETRIES = 3; // 최대 재시도 횟수
    let retryCount = 0; // 현재 재시도 횟수
    while (retryCount < MAX_RETRIES) {
      try {
        const eventResult = await this.reservationEventRepository.outBoxfindById(OutBoxEntity.of({id: model.eventId}), manager);
        if(!eventResult) throw new Error('아직 처리되지 않은 이벤트입니다..');

        const rollBackInfo = await this.reservationEventRepository.inBoxfindById(InBoxEntity.of({id: model.eventId}), manager);
        const payload = JSON.parse(rollBackInfo.payload);
        this.updateStatus(ReservationRequestModel.of({
          id: parseInt(payload.eventId),
          status: 'expire'
        }));
      } catch (error) {
        retryCount++;
        console.error(
          `Retry attempt ${retryCount}/${MAX_RETRIES} failed. Error: ${error}`
        );
        if (retryCount === MAX_RETRIES) {
                  // 이벤트 발행
          this.kafkaClient.emit(
            'payment.fail',
            {
                eventId: model.eventId,
                userId : model.userId,
            },
          );
        }
        await this.delay(1000); // 재시도 전에 1초 대기 (필요 시 조정 가능)
      }
    }
  }
  
  // 예약 상태 변경
  async updateStatus(model: ReservationRequestModel, manager?: EntityManager): Promise<void> {
    await this.reservationRepository.updateStatus(ReservationEntity.of(model), manager);
  }

  // 간단한 delay 함수 추가
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

}
