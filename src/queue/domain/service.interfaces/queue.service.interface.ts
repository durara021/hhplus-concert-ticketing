import { Injectable } from '@nestjs/common';
import { QueueRequestModel } from '../models';
import { QueueResponseCommand } from '../../app/commands';
import { EntityManager } from 'typeorm';

interface QueueServiceInterface {
  enter(model: QueueRequestModel, manager?:EntityManager): Promise<QueueResponseCommand>
  position(model: QueueRequestModel, manager?:EntityManager):Promise<QueueResponseCommand>
  updateStatus(model: QueueRequestModel, manager?:EntityManager): Promise<QueueResponseCommand>
}

@Injectable()
export abstract class AbstractQueueService implements QueueServiceInterface {
  abstract enter(model: QueueRequestModel, manager?:EntityManager): Promise<QueueResponseCommand>
  abstract position(model: QueueRequestModel, manager?:EntityManager):Promise<QueueResponseCommand>
  abstract updateStatus(model: QueueRequestModel, manager?:EntityManager): Promise<QueueResponseCommand>
}