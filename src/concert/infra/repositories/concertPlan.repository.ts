import { EntityManager } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AbstractConcertPlanRepository } from "../../domain/repository.interfaces";
import { InjectRepository } from "@nestjs/typeorm";
import { ConcertPlanEntity } from "../entities";
import { ConcertResponseModel } from "../../../concert/domain/models";

@Injectable()
export class ConcertPlanRepository implements AbstractConcertPlanRepository {

  async planInfo(concertPlanEntity:ConcertPlanEntity, manager:EntityManager): Promise<ConcertResponseModel | null> {
    return ConcertResponseModel.of(await manager.findOne(ConcertPlanEntity, {where: { concertId: concertPlanEntity.concertId }}));
  }

  async planInfos(concertPlanEntity:ConcertPlanEntity, manager:EntityManager): Promise<ConcertResponseModel[]> {
    return ConcertResponseModel.of(await manager.find(ConcertPlanEntity, {where: {concertId: concertPlanEntity.concertId}}));
  }

}
