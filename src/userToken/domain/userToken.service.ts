import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AbstractUserTokenService } from './interfaces/userToken.service.interface';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserTokenService implements AbstractUserTokenService{

  constructor(
    @Inject('TOKEN_CLIENT') private readonly redisClient: Redis
  ) {}

  // 유저토큰 생성
  async create(userId: number): Promise<string> {

    const uuid = uuidv4(); // UUID 생성 함수
    const issuedAt = Math.floor(Date.now() / 1000); // 등록 시간 (Unix 타임스탬프)
    const expiresIn = 1800; // 만료 시간 (초 단위)
    const expiryAt = issuedAt + expiresIn;
    const inQueue = false;

    // JWT 생성 시 Payload에 필요한 정보 추가
    const serverPayload = {
      userId, uuid,       // useId, uuid
      issuedAt, expiryAt, // 등록시간 / 만료 시간
      inQueue,            // 대기열 여부
    };

    const serverSecretKey = 'userToken-server-secret-key'; // 실제 환경에서는 환경변수로 관리
    const token = jwt.sign(serverPayload, serverSecretKey, { expiresIn });
    
    // Redis에 토큰 저장 (key: userId, value: token)
    const redisKey = `userToken:${uuid}`;
    await this.redisClient.set(redisKey, token, 'EX', expiresIn);
    
    const clientPayload = {
      uuid,               // uuid
      issuedAt, expiryAt, // 등록시간 / 만료 시간
      inQueue,            // 대기열 여부
    };
    const clientSecretKey = 'userToken-client-secret-key'; // 실제 환경에서는 환경변수로 관리
    
    return jwt.sign(clientPayload, clientSecretKey, { expiresIn });
  }


}
