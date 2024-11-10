import { Inject, Injectable } from "@nestjs/common";
import { AbstractConcertPlanCasheRepository } from "../../domain/repository.interfaces";
import { ConcertPlanResponseModel } from "../../domain/models";
import { ConcertPlanRequestEntity } from "../entities/concertPlan/concertPlan.request.entity";
import Redis from "ioredis";
import { ConcertPlanEntity } from "../entities";

@Injectable()
export class ConcertPlanCasheRepository implements AbstractConcertPlanCasheRepository {

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async planInfo(concertPlanEntity:ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel> {
    const concertInfo = await this.redis.hgetall(`concertPlan:concert:${concertPlanEntity.concertId}:${concertPlanEntity.concertPlanId}`);
    return ConcertPlanResponseModel.of(concertInfo);
  }

  async planInfos(concertPlanEntity:ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel[]> {
    const concertPlankeys = await this.redis.keys(`concertPlan:concert:${concertPlanEntity.concertId}:*`);
    
    //콘서트 정보를 가지고와서
    const concertPlanHashes = await Promise.all(
      concertPlankeys.map((key) => this.redis.hgetall(key))
    );

    const concertInfos = concertPlanHashes 
      .filter((concertPlanHashe) => Object.keys(concertPlanHashe).length > 0);
      
    //변환 후 리턴
    return ConcertPlanResponseModel.of(concertInfos);
  }

  async savePlanInfos(concertPlanEntiteis: ConcertPlanEntity[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    concertPlanEntiteis.forEach(concertPlanEntity => {
      // 콘서트 일정 정보 관리(Hash 자료구조 활용)
      pipeline.hset(
        `concertPlan:concert:${concertPlanEntity.concertId}:${concertPlanEntity.concertPlanId}`,
        {
          'concertPlan':`${concertPlanEntity.concertPlanId}`,
          'concert':`${concertPlanEntity.concertId}`,
          'concertDate':`${concertPlanEntity.concertDate}`,
          'isReservatable':`${concertPlanEntity.isReservatable}`,
          'capacity':`${concertPlanEntity.capacity}`,
          'current':`${concertPlanEntity.current}`,
        },
      );

      // 콘서트 일정 key 관리
      pipeline.sadd(`concertPlan:concert:${concertPlanEntity.concertId}` , `${concertPlanEntity.concertPlanId}`);

    });

    // 3. Pipeline 실행
    await pipeline.exec();
  }

}
