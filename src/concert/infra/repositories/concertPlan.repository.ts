import { EntityManager, In } from "typeorm";
import { Inject, Injectable } from "@nestjs/common";
import { AbstractConcertPlanRepository } from "../../domain/repository.interfaces";
import { ConcertPlanEntity } from "../entities";
import { ConcertPlanResponseModel } from "../../domain/models";
import { ConcertPlanRequestEntity } from "../entities/concertPlan/concertPlan.request.entity";
import Redis from "ioredis";

@Injectable()
export class ConcertPlanRepository implements AbstractConcertPlanRepository {

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async findById( concertPlanEntity:ConcertPlanRequestEntity, manager:EntityManager, ): Promise<ConcertPlanResponseModel> {

    // 캐시에서 조회
    const concertPlanCashe = ConcertPlanResponseModel.of(await this.redis.hgetall(`concertPlan:concert:${concertPlanEntity.concertId}:${concertPlanEntity.concertPlanId}`));
    let concertPlanInfo: ConcertPlanResponseModel;
    // 캐시에 없는 경우 DB 조회
    if(!concertPlanCashe){
      const concertPlanInfos = await this.DBtoCashe(manager);
      // 요구사항 추출
      concertPlanInfo = ConcertPlanResponseModel.of(concertPlanInfos.find(concertPlanInfo => concertPlanInfo.concertPlanId == concertPlanEntity.concertPlanId));
    } else {
      concertPlanInfo = ConcertPlanResponseModel.of(concertPlanCashe);
    }
    return concertPlanInfo;
  }

  async find( concertPlanEntity: ConcertPlanRequestEntity, manager:EntityManager, ): Promise<ConcertPlanResponseModel[]> {
    
    // 캐시에서 조회
    let concertPlanInfo: ConcertPlanResponseModel[];
    const concertPlankeys = await this.redis.keys(`concertPlan:concert:${concertPlanEntity.concertId}:*`);
    let concertPlanCashes = await Promise.all(
      concertPlankeys.map((key) => this.redis.hgetall(key))
    );

    // 캐시에 없는 경우 DB 조회
    if(concertPlanCashes.length < 1){
      const concertPlanInfos = await this.DBtoCashe(manager);
      // 요구사항 추출
      concertPlanInfo = ConcertPlanResponseModel.of(concertPlanInfos.filter(concertPlanInfo => concertPlanInfo.concertPlanId === concertPlanEntity.concertPlanId));
    } else {
      concertPlanCashes = concertPlanCashes 
        .filter((concertPlanCashe) => Object.keys(concertPlanCashe).length > 0);
      concertPlanInfo = ConcertPlanResponseModel.of(concertPlanCashes);
    }
    return concertPlanInfo 
  }

  private async DBtoCashe( manager:EntityManager, ): Promise<ConcertPlanEntity[]> {
    // Concert테이블 전체조회
    const concertPlanInfos:ConcertPlanEntity[] = await manager.find(ConcertPlanEntity);
    // 콘서트 정보 redis에 입력
    const pipeline = this.redis.pipeline();
    concertPlanInfos.forEach(concertPlanInfo => {
      pipeline.hset(
        `concertPlan:concert:${concertPlanInfo.concertId}:${concertPlanInfo.concertPlanId}`,
        {
          'concertPlan':`${concertPlanInfo.concertPlanId}`,
          'concert':`${concertPlanInfo.concertId}`,
          'concertDate':`${concertPlanInfo.concertDate}`,
          'isReservatable':`${concertPlanInfo.isReservatable}`,
          'capacity':`${concertPlanInfo.capacity}`,
          'current':`${concertPlanInfo.current}`,
        },
      );

    });
    // 3. Pipeline 실행
    await pipeline.exec();
    return concertPlanInfos;
  }

}
