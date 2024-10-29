import { Injectable } from '@nestjs/common';
import { SessionEntity } from '../../infra/entities';
import { EntityManager } from 'typeorm';

interface SessionServiceInterface{
  create(userId: number, manager?: EntityManager): Promise<SessionEntity>
  session(uuid: string, manager?: EntityManager): Promise<SessionEntity>
  updateStatus(uuid: string, manager?: EntityManager): Promise<SessionEntity>
}

@Injectable()
export abstract class AbstractSessionService implements SessionServiceInterface{
    abstract create(userId: number, manager?: EntityManager): Promise<SessionEntity>
    abstract session(uuid: string, manager?: EntityManager): Promise<SessionEntity>
    abstract updateStatus(uuid: string, manager?: EntityManager): Promise<SessionEntity>
}
