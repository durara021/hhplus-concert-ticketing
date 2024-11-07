import { EntityManager } from "typeorm";
import { ConcertEntity } from "../entities/concert/concert.entity";
import { Injectable } from "@nestjs/common";
import { AbstractConcertRepository } from "../../domain/repository.interfaces";
import { ConcertResponseModel } from "../../../concert/domain/models";

@Injectable()
export class ConcertRepository implements AbstractConcertRepository {
  
  async info(concertEntity:ConcertEntity, manager: EntityManager): Promise<ConcertResponseModel | undefined> {
    return ConcertResponseModel.of(await manager.findOne(ConcertEntity, { where: { concertId: concertEntity.concertId } }));
  }

  async infos(manager: EntityManager): Promise<ConcertResponseModel[] | undefined> {
    return ConcertResponseModel.of(await manager.find(ConcertEntity));
  }
}
