import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { ConcertTicketRequestEntity, ConcertTicketEntity } from "../../infra/entities";
import { ConcertTicketModel } from "../models/concertTicket/concertTicket.model";

interface ConcertTicketRepositoryInterface {
    findById( concertTicketEntity: ConcertTicketRequestEntity, manager:EntityManager, ): Promise<ConcertTicketModel>;
    find( concertTicketEntity?: ConcertTicketRequestEntity, manager?:EntityManager,): Promise<ConcertTicketModel[]>;
}

export abstract class AbstractConcertTicketRepository implements ConcertTicketRepositoryInterface {
    abstract findById( concertTicketEntity: ConcertTicketRequestEntity, manager:EntityManager,): Promise<ConcertTicketModel>;
    abstract find( concertTicketEntity?: ConcertTicketRequestEntity, manager?:EntityManager,): Promise<ConcertTicketModel[]>;
}