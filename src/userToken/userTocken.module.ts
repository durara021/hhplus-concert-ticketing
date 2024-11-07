import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTokenController } from './pres/userTocken.controller';
import { UserTokenUsecase } from './app/userToken.use-case';
import { AbstractUserTokenService } from './domain/interfaces/userToken.service.interface';
import { UserTokenService } from './domain/userToken.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ UserModule ],
  controllers: [UserTokenController],
  providers: [ UserTokenUsecase,
    { provide: AbstractUserTokenService, useClass: UserTokenService },
   ],
  exports: [ AbstractUserTokenService ], // 외부 모듈에서 사용할 수 있도록 export
})
export class UserTokenModule {}
