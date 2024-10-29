import { Injectable } from "@nestjs/common";
import { QueueEntity } from "../entities/queue.entity";
import { EntityManager } from "typeorm";
import { AbstractQueueRepository } from "../../../queue/domain/repository.interfaces";
import { QueueResponseModel } from "../../../queue/domain/models";

@Injectable()
export class QueueRepository implements AbstractQueueRepository{

  async myQueueInfo(queueEntity: QueueEntity, manager: EntityManager): Promise<QueueResponseModel | null>{
    return QueueResponseModel.of(await manager.findOne(QueueEntity, {
      where: {userId: queueEntity.userId}
    }));
  }

  async enter(queueEntity: QueueEntity, manager: EntityManager): Promise<QueueResponseModel> {
    return QueueResponseModel.of(await manager.save(queueEntity));
  }

  // 특정 사용자의 앞에 있는 대기열 사용자 수 계산
  async lastActiveUser(manager: EntityManager): Promise<QueueResponseModel | null> {
    return QueueResponseModel.of(await manager.findOne(QueueEntity, {
      where: { status: 'active' },
      order: { id: 'DESC' },
    }));
  }

  async expire(queueEntity: QueueEntity, manager: EntityManager): Promise<QueueResponseModel> {
    await manager.update(QueueEntity, 
      { userId: queueEntity.userId },
      { status: queueEntity.status }
    );

    return QueueResponseModel.of(await manager.findOne(QueueEntity, {where: { userId : queueEntity.userId }}));
  }

}