// queue.scheduler.ts
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import Redis from 'ioredis';

@Injectable()
export class QueueScheduler {

    constructor(
        @Inject('QUEUE_CLIENT') private readonly redisClient: Redis,
        private schedulerRegistry: SchedulerRegistry
    ) {}

  // 10분마다 실행되는 크론 작업
  @Cron(CronExpression.EVERY_10_MINUTES)
    async moveQueueToUseList() {
        const queueKey = 'queue';
        const useKey = 'use';
        const batchSize = 30;

        // 30명의 사용자 ID를 대기열에서 제거하여 사용열로 이동
        const usersToMove = await this.redisClient.lrange(queueKey, 0, batchSize - 1);
        
        if (usersToMove.length > 0) {
            await Promise.all([
                this.redisClient.ltrim(queueKey, usersToMove.length, -1), // 대기열에서 제거
                this.redisClient.rpush(useKey, ...usersToMove), // 사용열에 추가
            ]);
            console.log(`Moved ${usersToMove.length} users from queue to usage list.`);
        } else {
            console.log('No users in queue to move.');
        }
    }

}
