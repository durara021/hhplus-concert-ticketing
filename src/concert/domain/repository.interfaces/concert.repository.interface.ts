import { Injectable } from "@nestjs/common";
import { ConcertEntity } from "../../infra/entities/concert/concert.entity";
import { ConcertResponseModel } from "../models";
import { EntityManager } from "typeorm";

interface ConcertRepositoryInterface{
    info(manager:EntityManager, concertEntity: ConcertEntity): Promise<ConcertResponseModel>;
    infos(manager:EntityManager): Promise<ConcertResponseModel[]>;
}

@Injectable()
export abstract class AbstractConcertRepository implements ConcertRepositoryInterface{
    abstract info(manager:EntityManager, concertEntity: ConcertEntity): Promise<ConcertResponseModel>;
    abstract infos(manager:EntityManager): Promise<ConcertResponseModel[]>;
}