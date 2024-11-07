import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';

@Injectable()
export class QueueScheduler {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis
    ) {}

    // 10분마다 실행되는 크론 작업
    @Cron(CronExpression.EVERY_10_MINUTES)
    async moveQueueToUseList() {
        const useKey = 'use';
        const batchSize = 30;
        let remainingToMove = batchSize;
        let queueIdx = 0;

        while (remainingToMove > 0) {
            const queueKey = `queue:${queueIdx}`;

            // 현재 queueIdx에서 remainingToMove 수 만큼 사용자 추출
            const usersToMove = await this.redisClient.lrange(queueKey, 0, remainingToMove - 1);

            if (usersToMove.length === 0) {
                console.log(`No users in ${queueKey} to move.`);
                queueIdx++;
                continue; // 다음 queueIdx로 이동
            }

            // 사용열로 이동
            for (const uuid of usersToMove) {
                await this.redisClient.rpush(useKey, uuid);
            }

            // 대기열에서 이동된 사용자 삭제
            await this.redisClient.ltrim(queueKey, usersToMove.length, -1);
            console.log(`Moved ${usersToMove.length} users from ${queueKey} to usage list.`);

            // 이동한 수만큼 remainingToMove 감소
            remainingToMove -= usersToMove.length;

            // 현재 queueKey에서 남은 사용자가 충분하지 않으면 다음 queueIdx로 넘어감
            if (remainingToMove > 0) {
                queueIdx++;
            }
        }
    }
}
