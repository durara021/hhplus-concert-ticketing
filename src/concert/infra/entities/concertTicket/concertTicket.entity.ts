import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

type Part = Partial<ConcertTicketEntity>;

@Entity('concert_ticket')
export class ConcertTicketEntity {
    @PrimaryGeneratedColumn()
    concertTicketId: number;  // 자동 증가로 대기열 순번 역할 수행
    
    @Column()
    status: string; // 좌석 상태

    @Column()
    concertId: number;  // 콘서트 ID

    @Column()
    concertPlanId: number; // 콘서트 일정 ID

    @Column()
    concertSeatNum: number; //콘서트 좌석번호

    @Column()
    concertDate: Date;  // 콘서트 일정

    // of 메서드: Partial 타입을 이용해 객체를 생성
    static of(partial: Part): ConcertTicketEntity;
    static of(partial: Part[]): ConcertTicketEntity[];
    static of(
        partial: Part | Part[]
    ): ConcertTicketEntity | ConcertTicketEntity[] {
        if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
        return new ConcertTicketEntity({ ...partial });
    }

    // 생성자에서 전개 연산자를 사용해 필드 초기화
    constructor(partial: Partial<ConcertTicketEntity>) {
        Object.assign(this, partial);
    }
  
}