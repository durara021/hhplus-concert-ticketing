import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

type Part = Partial<ConcertPlanEntity>;

@Entity('concert_plan')
export class ConcertPlanEntity {
  @PrimaryGeneratedColumn()
  id: number;  // 자동 증가로 대기열 순번 역할 수행

  @Column()
  concertId: number;  // 콘서트 ID

  @Column()
  concertDate: Date;  // 콘서트 일정

  @Column()
  capacity: number; // 콘서트 정원

  @Column()
  current:number; // 콘서트 예약 인원

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): ConcertPlanEntity;
  static of(partial: Part[]): ConcertPlanEntity[];
  static of(
    partial: Part | Part[]
  ): ConcertPlanEntity | ConcertPlanEntity[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new ConcertPlanEntity({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<ConcertPlanEntity>) {
    Object.assign(this, partial);
  }
  
}