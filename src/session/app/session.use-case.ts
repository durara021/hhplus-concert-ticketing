import { Injectable } from '@nestjs/common';
import { SessionPostResponseDto as ResPostDto } from "../pres/dto";
import { AbstractUserService } from '../../user/domain/service.interfaces/user.service.interface';
import { DataSource, EntityManager } from 'typeorm';
import { AbstractSessionService } from '../domain/service.interfaces/session.service.interface';

@Injectable()
export class SessionUsecase {

    constructor(
        private readonly sessionService: AbstractSessionService,
        private readonly userService: AbstractUserService,
        private readonly dataSource: DataSource,
    ) {}

    //세션 생성
    async create(userId: number): Promise<ResPostDto> {
        return await this.dataSource.transaction(async (manager: EntityManager) => {
            //아이디 확인
            const user = await this.userService.user(userId, manager);
            //세션 생성
            const session = await this.sessionService.create(user.id, manager);

            return ResPostDto.of({uuid:session.uuid, userId:session.userId, regDate:new Date(session.regDate)});
        });
    }

}
