import { Injectable } from "@nestjs/common";
import { ConcertEntity } from "../../infra/entities/concert/concert.entity";
import { ConcertResponseModel } from "../models";
import { EntityManager } from "typeorm";

interface ConcertRepositoryInterface{
    findById( concertEntity?: ConcertEntity, manager?:EntityManager ): Promise<ConcertResponseModel>;
}

@Injectable()
export abstract class AbstractConcertRepository implements ConcertRepositoryInterface{
    abstract findById( concertEntity?: ConcertEntity, manager?:EntityManager ): Promise<ConcertResponseModel>;
}