import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SessionEntity } from '../infra/entities';
import { AbstractSessionRepository } from './repository.interfaces';
import { AbstractSessionService } from './service.interfaces/session.service.interface';
import { DataSource, EntityManager } from 'typeorm';
import { NotFoundError } from 'rxjs';

@Injectable()
export class SessionService implements AbstractSessionService{

  constructor(
    private readonly sessionRepository: AbstractSessionRepository,
    private readonly dataSource: DataSource,
  ) {}

  private uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

// 세션 생성
  async create(userId: number, manager: EntityManager, attempt = 0): Promise<SessionEntity> {
    const executeCreate = async (manager: EntityManager): Promise<SessionEntity> => {
      const sessionEntity: SessionEntity = SessionEntity.of({ uuid: this.uuidv4(), userId: userId });
      
      try {
        return await this.sessionRepository.create(sessionEntity, manager);
      } catch (error) {
        if (error instanceof ConflictException && attempt < 3) {
          return this.create(userId, manager, attempt + 1);
        } else if (error instanceof ConflictException) {
          throw new ConflictException('UUID가 중복되어 세션을 생성할 수 없습니다.');
        }
        throw error;
      }
    }
    return manager ? executeCreate(manager) : this.dataSource.transaction(executeCreate);
  }
  
  async session(uuid: string, manager: EntityManager): Promise<SessionEntity> {
    const executeSession = async (manager: EntityManager): Promise<SessionEntity> => {
      const sessionEntity: SessionEntity = SessionEntity.of({uuid:uuid, status:'expired'});
      
      return this.sessionRepository.session(sessionEntity, manager);
    }
    return manager ? executeSession(manager) : this.dataSource.transaction(executeSession);
  }
  
  async updateStatus(uuid: string, manager: EntityManager): Promise<SessionEntity> {
    const executeUpdateStatus = async (manager: EntityManager): Promise<SessionEntity> => {
      const session = this.session(uuid, manager);
      if(!session) throw new NotFoundException('세션을 찾을 수 없습니다.');
      const sessionEntity: SessionEntity = SessionEntity.of({uuid:uuid, status:'expired'});

      return this.sessionRepository.updateStatus(sessionEntity, manager);
    }
    return manager ? executeUpdateStatus(manager) : this.dataSource.transaction(executeUpdateStatus);
  }
}
