import { Injectable } from "@nestjs/common";
import { ConcertTicketEntity, ConcertTicketRequestEntity } from "../../infra/entities";
import { ConcertTicketModel } from "../models/concertTicket/concertTicket.model";

interface ConcertTicketCasheRepositoryInterface{
    ticketInfo(concertTicketEntity: ConcertTicketRequestEntity): Promise<ConcertTicketModel>;
    ticketInfos(concertTicketEntity: ConcertTicketRequestEntity): Promise<ConcertTicketModel[]>;
}

@Injectable()
export abstract class AbstractConcertTicketCasheRepository implements ConcertTicketCasheRepositoryInterface{
    abstract ticketInfo(concertTicketEntity: ConcertTicketRequestEntity): Promise<ConcertTicketModel>;
    abstract ticketInfos(concertTicketEntity?: ConcertTicketRequestEntity): Promise<ConcertTicketModel[]>;
}