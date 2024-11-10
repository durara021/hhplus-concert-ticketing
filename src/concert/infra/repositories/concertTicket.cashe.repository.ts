import Redis from "ioredis";
import { Inject, Injectable } from "@nestjs/common";
import { AbstractConcertTicketCasheRepository } from "../../domain/repository.interfaces";
import { ConcertTicketEntity, ConcertTicketRequestEntity } from "../entities";
import { ConcertTicketModel } from "../../domain/models";

@Injectable()
export class ConcertTicketCasheRepository implements AbstractConcertTicketCasheRepository {

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async ticketInfo(concertTicketEntity:ConcertTicketRequestEntity): Promise<ConcertTicketModel> {
    const concertTicketInfo = await this.redis.hgetall(`concertTicket:concert:${concertTicketEntity.concertId}:concertPlan:${concertTicketEntity.concertPlanId}:${concertTicketEntity.concertTicketId}`);
    return ConcertTicketModel.of(concertTicketInfo);
  }

  async ticketInfos(concertTicketEntity:ConcertTicketRequestEntity): Promise<ConcertTicketModel[]> {
    const concertTicketkeys = await this.redis.keys(`concertTicket:concert:${concertTicketEntity.concertId}:concertPlan:${concertTicketEntity.concertPlanId}:*`);
    
    //콘서트 정보를 가지고와서
    const concertTicketHashes = await Promise.all(
      concertTicketkeys.map((key) => this.redis.hgetall(key))
    );

    const concertInfos = concertTicketHashes 
      .filter((concertTicketHashe) => Object.keys(concertTicketHashe).length > 0);
      
    //변환 후 리턴
    return ConcertTicketModel.of(concertInfos);
  }

}
