import { EntityManager, In } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AbstractConcertTicketRepository } from "../../domain/repository.interfaces";
import { ConcertTicketRequestEntity, ConcertTicketEntity } from "../entities";
import { ConcertTicketModel } from "../../domain/models";

@Injectable()
export class ConcertTicketRepository implements AbstractConcertTicketRepository {

  async findById( concertTiekctEntity:ConcertTicketRequestEntity, manager:EntityManager, ): Promise<ConcertTicketModel> {
    return ConcertTicketModel.of(await manager.findOne(ConcertTicketEntity, {where: { concertPlanId: concertTiekctEntity.concertPlanId }}));
  }

  async find( concertTiekctEntity:ConcertTicketRequestEntity, manager:EntityManager, ): Promise<ConcertTicketModel[]> {
    return ConcertTicketModel.of(await manager.find(ConcertTicketEntity, {where: {concertId: In(concertTiekctEntity.concertPlanIds)}}))
  }

}
