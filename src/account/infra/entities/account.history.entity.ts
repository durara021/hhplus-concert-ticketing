import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

type Part = Partial<AccountHistoryEntity>;

@Entity('accountHistory')
export class AccountHistoryEntity {
  
  @PrimaryGeneratedColumn()
  id: number;  // 자동 증가로 대기열 순번 역할 수행

  @Column()
  userId: number;  // 계좌 소유자

  @Column()
  amount: number; // 충전하는 point 양

  @Column()
  stat: string; // 충전/사용 구분

  @CreateDateColumn()
  regDate: Date; // 등록일

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): AccountHistoryEntity;
  static of(partial: Part[]): AccountHistoryEntity[];
  static of(
    partial: Part | Part[]
  ): AccountHistoryEntity | AccountHistoryEntity[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new AccountHistoryEntity({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<AccountHistoryEntity>) {
    Object.assign(this, partial);
  }
}