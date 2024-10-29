import { Injectable } from '@nestjs/common';
import { QueueRequestModel } from './models';
import { QueueResponseCommand } from '../app/commands';
import { QueueEntity } from '../infra/entities';
import { AbstractQueueRepository } from './repository.interfaces';
import { AbstractQueueService } from './service.interfaces'
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class QueueService implements AbstractQueueService{

  constructor(
    private readonly queueRepository: AbstractQueueRepository,
    private readonly dataSource: DataSource,
  ) {}

  //대기열 진입
  async enter(model: QueueRequestModel, manager?:EntityManager): Promise<QueueResponseCommand> {
    const executeEnter = async (manager: EntityManager): Promise<QueueResponseCommand> => {
      await this.queueRepository.enter(QueueEntity.of(model), manager);
      return this.position(model, manager);
    }
    return manager ? executeEnter(manager) : this.dataSource.transaction(executeEnter);
  }

  //내 대기열 순서
  async position(model: QueueRequestModel, manager?:EntityManager):Promise<QueueResponseCommand> {
    const executePosition = async (manager: EntityManager): Promise<QueueResponseCommand> => {
      const queue = await this.queueRepository.myQueueInfo(QueueEntity.of(model), manager)
      const position = (await this.queueRepository.lastActiveUser(manager)).id - queue.id;
      model.updateMyPosition(position);
      
      return QueueResponseCommand.of(model);
    }
    return manager ? executePosition(manager) : this.dataSource.transaction(executePosition);
  }
  
  //대기열 만료
  async updateStatus(model: QueueRequestModel, manager?:EntityManager): Promise<QueueResponseCommand> {
    const executeUpdateStatus = async (manager: EntityManager): Promise<QueueResponseCommand> => {
      return QueueResponseCommand.of(await this.queueRepository.updateStatus(QueueEntity.of(model), manager));
    }
    return manager ? executeUpdateStatus(manager) : this.dataSource.transaction(executeUpdateStatus);
  }
  
}
