import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

type Part = Partial<QueueEntity>;

@Entity('queue')
export class QueueEntity {
  @PrimaryGeneratedColumn()
  id: number;  // 자동 증가로 대기열 순번 역할 수행

  @Column()
  userId: number;  // 사용자 ID

  @Column()
  uuid: string;  // 세션 식별을 위한 UUID

  @Index()
  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;  // 생성 시간

  @UpdateDateColumn()
  updatedAt: Date;  // 수정 시간
    
  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): QueueEntity;
  static of(partial: Part[]): QueueEntity[];
  static of(
    partial: Part | Part[]
  ): QueueEntity | QueueEntity[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new QueueEntity({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<QueueEntity>) {
      Object.assign(this, partial);
  }
}