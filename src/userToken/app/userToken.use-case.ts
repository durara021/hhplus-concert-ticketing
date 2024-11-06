import { Injectable } from '@nestjs/common';
import { UserTokenPostResponseDto as ResPostDto } from "../pres/dto";
import { AbstractUserService } from '../../user/domain/service.interfaces/user.service.interface';
import { DataSource, EntityManager } from 'typeorm';
import { AbstractUserTokenService } from '../domain/interfaces/userToken.service.interface';

@Injectable()
export class UserTokenUsecase {

    constructor(
        private readonly userTokenService: AbstractUserTokenService,
        private readonly userService: AbstractUserService,
        private readonly dataSource: DataSource,
    ) {}

    //세션 생성
    async create(userId: number): Promise<ResPostDto> {
        return await this.dataSource.transaction(async (manager: EntityManager) => {
            //아이디 확인
            const user = await this.userService.user(userId, manager);

            //세션 생성
            const userToken = await this.userTokenService.create(user.id);
            return ResPostDto.of({userToken:userToken});
        });
    }

}
