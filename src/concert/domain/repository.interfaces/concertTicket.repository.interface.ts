import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { ConcertTicketRequestEntity, ConcertTicketEntity } from "../../infra/entities";
import { ConcertTicketModel } from "../models/concertTicket/concertTicket.model";

interface ConcertTicketRepositoryInterface {
    ticketInfo(manager:EntityManager, concertTicketEntity: ConcertTicketRequestEntity): Promise<ConcertTicketModel>;
    ticketInfos(manager:EntityManager, concertTicketEntity: ConcertTicketRequestEntity): Promise<ConcertTicketModel[]>;
}

@Injectable()
export abstract class AbstractConcertTicketRepository implements ConcertTicketRepositoryInterface {
    abstract ticketInfo(manager:EntityManager, concertTicketEntity: ConcertTicketRequestEntity): Promise<ConcertTicketModel>;
    abstract ticketInfos(manager:EntityManager, concertTicketEntity?: ConcertTicketRequestEntity): Promise<ConcertTicketModel[]>;
}