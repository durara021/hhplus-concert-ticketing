import { EntityManager } from "typeorm";
import { ConcertEntity } from "../entities/concert/concert.entity";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AbstractConcertRepository } from "../../domain/repository.interfaces";
import { ConcertResponseModel } from "../../../concert/domain/models";
import Redis from "ioredis";

@Injectable()
export class ConcertRepository implements AbstractConcertRepository {
  
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async findById( concertEntity:ConcertEntity, manager: EntityManager ): Promise<ConcertResponseModel | undefined> {
    
    // 캐시에서 조회
    const concertCashe = await this.redis.hgetall(`concert:${concertEntity.concertId}`)
    let concertInfo:ConcertResponseModel;
    if(!concertCashe){
      // Concert테이블 전체조회
      const concertInfos:ConcertEntity[] = await manager.find(ConcertEntity);
      // 콘서트 정보 redis에 입력
      const pipeline = this.redis.pipeline();
      concertInfos.forEach(concertInfo => {
        pipeline.hset(
          `concert:${concertInfo.concertId}`,
          {
            'concert':`${concertInfo.concertId}`,
            'title': `${concertInfo.title}`,
            'regDate': `${concertInfo.regDate}`,
          },
        );

      });
      // 3. Pipeline 실행
      await pipeline.exec();

      // 기존 찾던 정보 반환
      concertInfo = ConcertResponseModel.of(concertInfos.find(concertInfo => concertInfo.concertId == concertEntity.concertId));
    } else {
      concertInfo = ConcertResponseModel.of(concertCashe);
    }

    if(!concertInfo) throw new NotFoundException("콘서트 정보를 찾을 수 없습니다.");
    return concertInfo;
  }

}
