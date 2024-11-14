import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { ConcertPlanRequestEntity } from "../../infra/entities";
import { ConcertPlanResponseModel } from "../models";

interface ConcertPlanRepositoryInterface{
    findById( concertPlanEntity?: ConcertPlanRequestEntity, manager?:EntityManager, ): Promise<ConcertPlanResponseModel>;
    find( concertPlanEntity?: ConcertPlanRequestEntity, manager?:EntityManager, ): Promise<ConcertPlanResponseModel[]>;
}

@Injectable()
export abstract class AbstractConcertPlanRepository implements ConcertPlanRepositoryInterface{
    abstract findById( concertPlanEntity?: ConcertPlanRequestEntity, manager?:EntityManager, ): Promise<ConcertPlanResponseModel>;
    abstract find( concertPlanEntity?: ConcertPlanRequestEntity, manager?:EntityManager, ): Promise<ConcertPlanResponseModel[]>;
}