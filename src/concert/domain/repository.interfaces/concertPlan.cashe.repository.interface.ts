import { Injectable } from "@nestjs/common";
import { ConcertPlanEntity, ConcertPlanRequestEntity } from "../../infra/entities";
import { ConcertPlanResponseModel } from "../models";

interface ConcertPlanCasheRepositoryInterface{
    planInfo(concertPlanRequestEntity: ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel>;
    planInfos(concertPlanRequestEntity?: ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel[]>;
    savePlanInfos(concertPlanRequestEntities: ConcertPlanEntity[]): Promise<void>;
}

@Injectable()
export abstract class AbstractConcertPlanCasheRepository implements ConcertPlanCasheRepositoryInterface{
    abstract planInfo(PlanCasheRepoconcertPlanEntity: ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel>;
    abstract planInfos(PlanCasheRepoconcertPlanEntity?: ConcertPlanRequestEntity): Promise<ConcertPlanResponseModel[]>;
    abstract savePlanInfos(concertPlanRequestEntities: ConcertPlanEntity[]): Promise<void>;
}