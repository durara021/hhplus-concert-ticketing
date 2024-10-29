import { EntityManager, Not, Repository } from "typeorm";
import { SessionEntity } from "../entities/session.entity";
import { Injectable } from "@nestjs/common";
import { AbstractSessionRepository } from "../../domain/repository.interfaces";

@Injectable()
export class SessionRepository implements AbstractSessionRepository {

  async create(sessionEntity:SessionEntity, manager:EntityManager): Promise<SessionEntity> {
    return await manager.save(sessionEntity);
  }

  async session(sessionEntity: SessionEntity, manager:EntityManager): Promise<SessionEntity> {
    return await manager.findOne(SessionEntity, 
      { where: { uuid : sessionEntity.uuid, } }
    );
  }
  
  async updateStatus(sessionEntity: SessionEntity, manager:EntityManager): Promise<SessionEntity> {
    await manager.update(SessionEntity, 
      { uuid : sessionEntity.uuid },
      { status: sessionEntity.status }
    );

    return manager.findOne(SessionEntity, 
      { where : { uuid: sessionEntity.uuid } }
    );
  }

}
