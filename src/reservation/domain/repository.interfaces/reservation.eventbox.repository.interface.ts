import { Injectable } from "@nestjs/common";
import { InBoxEntity, OutBoxEntity } from "../../infra/entities";
import { EntityManager } from "typeorm";

interface ReservationRepositoryEventInterface{
    saveOutBox(accountOutBoxEntity: OutBoxEntity, manager: EntityManager): Promise<void>;
    saveInBox(accountOutBoxEntity: OutBoxEntity, manager: EntityManager): Promise<void>;
    outBoxfindById(accountOutBoxEntity: OutBoxEntity, manager: EntityManager): Promise<OutBoxEntity>;
    inBoxfindById(accountOutBoxEntity: InBoxEntity, manager: EntityManager): Promise<InBoxEntity>;
}

@Injectable()
export abstract class AbstractReservationEventRepository implements ReservationRepositoryEventInterface{
    abstract saveOutBox(accountOutBoxEntity: OutBoxEntity, manager: EntityManager): Promise<void>;
    abstract saveInBox(accountOutBoxEntity: OutBoxEntity, manager: EntityManager): Promise<void>;
    abstract outBoxfindById(accountOutBoxEntity: OutBoxEntity, manager: EntityManager): Promise<OutBoxEntity>;
    abstract inBoxfindById(accountOutBoxEntity: InBoxEntity, manager: EntityManager): Promise<InBoxEntity>;
}