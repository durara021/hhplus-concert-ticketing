import { ConcertEntity } from "../entities/concert/concert.entity";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AbstractConcertCasheRepository } from "src/concert/domain/repository.interfaces/concert.cashe.repository.interface";
import { ConcertResponseModel } from "../../domain/models";
import Redis from "ioredis";

@Injectable()
export class ConcertCasheRepository implements AbstractConcertCasheRepository {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  //콘서트 정보(단일)
  async info(concertEntity:ConcertEntity): Promise<ConcertResponseModel | undefined> {
    const concertInfo = await this.redis.hgetall(`concert:${concertEntity.concertId}`);
    return ConcertResponseModel.of(concertInfo);
  }

  //콘서트 정보(복수)
  async infos(): Promise<ConcertResponseModel[] | undefined> {
    const concertPlankeys = await this.redis.keys(`concert:*`);
    
    //콘서트 정보를 가지고와서
    const concertHashes = await Promise.all(
      concertPlankeys.map((key) => this.redis.hgetall(key))
    );

    const concertInfos = concertHashes 
      .filter((concertHashe) => Object.keys(concertHashe).length > 0);
      
    //변환 후 리턴
    return ConcertResponseModel.of(concertInfos);
  }

  async saveInfos(concertEntiteis: ConcertEntity[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    concertEntiteis.forEach(concertEntity => {
      // 콘서트 정보 관리(Hash 자료구조 활용)
      pipeline.hset(
        `concert:${concertEntity.concertId}`,
        {
          'concert':`${concertEntity.concertId}`,
          'title': `${concertEntity.title}`,
          'regDate': `${concertEntity.regDate}`,
        },
      );

      // 콘서트 정보 key 관리
      pipeline.sadd('concert', `${concertEntity.concertId}`);

    });

    // 3. Pipeline 실행
    await pipeline.exec();
  }

}
