// queue.guard.ts
import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import Redis from 'ioredis';

@Injectable()
export class UserTokenGuard implements CanActivate {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const authHeader = request.headers['authorization'];

    let userId: number;
    let queueIdx: number;
    let uuid: string;

    const clientSecretKey = 'userToken-server-secret-key';
    const serverSecretKey = 'serverToken-client-secret-key';

    if (!authHeader) {
      return request.status(401).json({ message: 'Authorization header missing' });
    }

    // 클라이언트 토큰 추출
    const clientToken = authHeader.split(' ')[1];

    try {
      // JWT 토큰 검증 및 uuid 추출
      uuid = (jwt.verify(clientToken, clientSecretKey) as { uuid: string }).uuid;

      // Redis에서 userId 조회
      const redisKey = `userToken:${uuid}`;
      const serverToken = await this.redisClient.get(redisKey);
      
      if (!serverToken) {
        return request.status(401).json({ message: '유저토큰이 만료되었거나 조회되지 않습니다.' });
      }

      // Redis에 저장된 서버 토큰에서 userId 추출
      userId = parseInt((jwt.verify(serverToken, serverSecretKey) as { userId: string }).userId);
      queueIdx = parseInt((jwt.verify(serverToken, serverSecretKey) as { queueIdx: string }).queueIdx);

      // 요청 객체에 userId 추가하여 이후 핸들러에서 사용 가능하게 설정
      request.body.userId = userId;

    } catch (error) {
      return request.status(403).json({ message: 'Invalid token' });
    }

    const targetApiPath = '/:concertId/dates/:date/seats'; // 대기열 체크할 API 경로

    // 요청이 특정 API에 해당하는지 확인
    if (request.path !== targetApiPath) {
      return true; // 대기열 체크 대상이 아니면 접근 허용
    }

    // 대기열 및 사용열 상태 확인
    const queueKey = `queue:${queueIdx}`;
    const useKey = 'use';

    // 사용열 확인
    const isInUse = await this.redisClient.lpos(useKey, userId);
    if (isInUse !== null) {
      // 사용열에 있으면 접근 허용
      return true;
    }

    // 대기열 확인
    const isInQueue = await this.redisClient.lpos(queueKey, userId);
    if (isInQueue !== null) {
      // 대기열에 있는 경우 현재 대기열 순서를 반환
      request.body.queuePosition = isInQueue + 1; // 0부터 시작하므로 +1
      return false; // 현재 순서만 반환하고 요청은 허용하지 않음
    }

    // 대기열에 없으면 추가
    await this.redisClient.rpush(queueKey, userId); // 대기열에 추가

    const issuedAt = Math.floor(Date.now() / 1000); // 등록 시간 (Unix 타임스탬프)
    const expiresIn = 3600; // 만료 시간 (초 단위)
    const expiryAt = issuedAt + expiresIn;
    const newPosition = await this.redisClient.lpos(queueKey, userId) + 1;

    const clientPayload = {
      uuid,               // uuid
      issuedAt, expiryAt, // 등록시간 / 만료 시간
      queueIdx, newPosition,
    };
    
    const newClientToken = jwt.sign(clientPayload, clientSecretKey, { expiresIn });
    response.setHeader('Authorization', `Bearer ${newClientToken}`);
    
    const serverPayload = {
      uuid, userId,
      issuedAt, expiryAt,
      queueIdx, newPosition,
    };
    const newServerToken = jwt.sign(serverPayload, clientSecretKey, { expiresIn });
    
    await this.redisClient.set(`userToekn:${uuid}`, newServerToken, 'EX', 3600); // 30분 TTL 설정
    // 대기열에 추가했으므로 접근은 허용하지 않음
    return false;
  }
}
