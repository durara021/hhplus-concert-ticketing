import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { ConcertPlanRequestEntity } from "../../infra/entities";
import { ConcertPlanResponseModel } from "../models";

interface ConcertPlanRepositoryInterface{
    planInfo(manager:EntityManager, concertPlanEntity: ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel>;
    planInfos(manager:EntityManager, concertPlanEntity?: ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel[]>;
}

@Injectable()
export abstract class AbstractConcertPlanRepository implements ConcertPlanRepositoryInterface{
    abstract planInfo(manager:EntityManager, concertPlanEntity: ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel>;
    abstract planInfos(manager:EntityManager, concertPlanEntity?: ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel[]>;
}