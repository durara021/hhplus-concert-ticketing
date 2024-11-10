import { EntityManager, In } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AbstractConcertTicketRepository } from "../../domain/repository.interfaces";
import { ConcertTicketRequestEntity, ConcertTicketResponseEntity } from "../entities";
import { ConcertTicketModel } from "../../domain/models";

@Injectable()
export class ConcertTicketRepository implements AbstractConcertTicketRepository {

  async ticketInfo(manager:EntityManager, concertTiekctEntity:ConcertTicketRequestEntity): Promise<ConcertTicketModel> {
    return ConcertTicketModel.of(await manager.findOne(ConcertTicketResponseEntity, {where: { concertPlanId: concertTiekctEntity.concertPlanId }}));
  }

  async ticketInfos(manager:EntityManager, concertTiekctEntity?:ConcertTicketRequestEntity): Promise<ConcertTicketModel[]> {
    return concertTiekctEntity 
      ? ConcertTicketModel.of(await manager.find(ConcertTicketResponseEntity, {where: {concertId: In(concertTiekctEntity.concertPlanIds)}}))
      : ConcertTicketModel.of(await manager.find(ConcertTicketResponseEntity));
  }

}
