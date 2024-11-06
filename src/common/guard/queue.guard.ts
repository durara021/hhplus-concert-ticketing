// queue.guard.ts
import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class QueueGuard implements CanActivate {
  constructor(
    @Inject('QUEUE_CLIENT') private readonly redisClient: Redis
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.body.userId; // 미들웨어에서 설정된 userId
    const targetApiPath = '/target-api'; // 대기열 체크할 API 경로

    // 요청이 특정 API에 해당하는지 확인
    if (request.path !== targetApiPath) {
      return true; // 대기열 체크 대상이 아니면 접근 허용
    }

    // 대기열 및 사용열 상태 확인
    const queueKey = 'queue';
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
    const newPosition = await this.redisClient.lpos(queueKey, userId) + 1;
    request.body.queuePosition = newPosition;

    // 대기열에 추가했으므로 접근은 허용하지 않음
    return false;
  }
}
