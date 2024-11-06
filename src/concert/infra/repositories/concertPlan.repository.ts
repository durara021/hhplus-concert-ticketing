import { EntityManager, In } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AbstractConcertPlanRepository } from "../../domain/repository.interfaces";
import { ConcertPlanEntity } from "../entities";
import { ConcertPlanResponseModel, ConcertResponseModel } from "../../../concert/domain/models";
import { ConcertPlanRequestEntity } from "../entities/concertPlan/concertPlan.request.entity";

@Injectable()
export class ConcertPlanRepository implements AbstractConcertPlanRepository {

  async planInfo(manager:EntityManager, concertPlanEntity:ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel> {
    return ConcertPlanResponseModel.of(await manager.findOne(ConcertPlanEntity, {where: { concertPlanId: concertPlanEntity.concertPlanId }}));
  }

  async planInfos(manager:EntityManager, concertPlanEntity?:ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel[]> {
    return concertPlanEntity 
      ? ConcertPlanResponseModel.of(await manager.find(ConcertPlanEntity, {where: {concertId: In(concertPlanEntity.concertIds)}}))
      : ConcertPlanResponseModel.of(await manager.find(ConcertPlanEntity));
  }

}
