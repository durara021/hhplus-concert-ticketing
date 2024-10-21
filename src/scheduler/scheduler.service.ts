// app/scheduler/scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueSchedulerRepository } from './queue.scheduler.repository';
import { AbstractReservationService } from 'src/reservation/domain/service.interfaces';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly queueRepository: QueueSchedulerRepository,
    private readonly reservationService : AbstractReservationService,
  ) {}

  // 10분마다 대기열의 상태를 업데이트하는 작업
  @Cron(CronExpression.EVERY_10_MINUTES)
  async activateWaitingQueue() {
    console.log('10분마다 대기열의 waiting 상태를 active로 변경합니다.');

    // 100명의 waiting 상태 사용자 active 상태로 변경
    const users = await this.queueRepository.waitingUsers(100);
    const userIds = users.map(user => user.id);

    // 사용자 상태 업데이트
    await this.queueRepository.updateUsersToActive(userIds);
    console.log(`${userIds.length}명의 사용자를 active 상태로 변경 완료`);
  }

  @Cron(CronExpression.EVERY_MINUTE) // 매 분마다 실행
  async removeUnconfirmedReservations() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const reservationList = await this.reservationService.itemsByStatus('temp');
    const expiredReservations = reservationList.filter(reservation => reservation.regDate < fiveMinutesAgo);
    
    await this.reservationService.statusesUpdate(expiredReservations);
    console.log('5분이 경과된 임시 티켓 예약이 삭제되었습니다.');
  }

}
