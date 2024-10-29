import { Injectable } from "@nestjs/common";
import { QueueEntity } from "../../infra/entities/queue.entity";
import { QueueResponseModel } from "../models";
import { EntityManager } from "typeorm";


interface QueueRepositoryInterface{
    enter(queueEntity: QueueEntity, manager:EntityManager): Promise<QueueResponseModel>
    lastActiveUser(manager:EntityManager): Promise<QueueResponseModel>
    updateStatus(queueEntity: QueueEntity, manager:EntityManager): Promise<QueueResponseModel>
    myQueueInfo(queueEntity: QueueEntity, manager:EntityManager): Promise<QueueResponseModel>
}

@Injectable()
export abstract class AbstractQueueRepository implements QueueRepositoryInterface{
    abstract enter(queueEntity: QueueEntity, manager:EntityManager): Promise<QueueResponseModel>
    abstract lastActiveUser(manager:EntityManager): Promise<QueueResponseModel>
    abstract updateStatus(queueEntity: QueueEntity, manager:EntityManager): Promise<QueueResponseModel>
    abstract myQueueInfo(queueEntity: QueueEntity, manager:EntityManager): Promise<QueueResponseModel>
}