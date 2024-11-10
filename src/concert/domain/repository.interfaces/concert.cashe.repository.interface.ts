import { Injectable } from "@nestjs/common";
import { ConcertEntity } from "../../infra/entities/concert/concert.entity";
import { ConcertResponseModel } from "../models";
import { EntityManager } from "typeorm";

interface ConcertCasheRepositoryInterface{
    info(concertEntity: ConcertEntity): Promise<ConcertResponseModel>;
    infos(): Promise<ConcertResponseModel[]>;
    saveInfos(concertEntities: ConcertEntity[]): Promise<void>;
}

@Injectable()
export abstract class AbstractConcertCasheRepository implements ConcertCasheRepositoryInterface{
    abstract info(concertEntity: ConcertEntity): Promise<ConcertResponseModel>;
    abstract infos(): Promise<ConcertResponseModel[]>;
    abstract saveInfos(concertEntities: ConcertEntity[]): Promise<void>;
}