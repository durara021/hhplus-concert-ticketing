import { Injectable } from "@nestjs/common";
import { SessionEntity } from "../../infra/entities/session.entity";
import { EntityManager } from "typeorm";

interface SessionRepositoryInterface{
    create(sessionEntity: SessionEntity, manager: EntityManager): Promise<SessionEntity>;
    session(sessionEntity: SessionEntity, manager: EntityManager): Promise<SessionEntity>;
    updateStatus(sessionEntity: SessionEntity, manager: EntityManager): Promise<SessionEntity>;
}

@Injectable()
export abstract class AbstractSessionRepository implements SessionRepositoryInterface{
    abstract create(sessionEntity: SessionEntity, manager: EntityManager): Promise<SessionEntity>
    abstract session(sessionEntity: SessionEntity, manager: EntityManager): Promise<SessionEntity>
    abstract updateStatus(sessionEntity: SessionEntity, manager: EntityManager): Promise<SessionEntity>
}