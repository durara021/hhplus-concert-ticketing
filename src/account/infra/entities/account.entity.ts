import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

type Part = Partial<AccountEntity>;

@Entity('account')
export class AccountEntity {
  @PrimaryGeneratedColumn()
  id: number;  // 자동 증가로 대기열 순번 역할 수행

  @Column()
  userId: number;  // 계좌 소유자

  @Column()
  balance: number; // 총액

  @Column({default: 0})
  version: number;

  static of(partial: Part): AccountEntity;
  static of(partial: Part[]): AccountEntity[];
  static of(
    partial: Part | Part[]
  ): AccountEntity | AccountEntity[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new AccountEntity({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<AccountEntity>) {
    Object.assign(this, partial);
  }

}