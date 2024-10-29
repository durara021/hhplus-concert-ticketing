import { Injectable } from "@nestjs/common";
import { Column, PrimaryGeneratedColumn } from "typeorm";

type Part = Partial<PaymentEntity>;

@Injectable()
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  reservationId: number;

  @Column({default: Date.now()})
  regDate: Date;

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): PaymentEntity;
  static of(partial: Part[]): PaymentEntity[];
  static of(
    partial: Part | Part[]
  ): PaymentEntity | PaymentEntity[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new PaymentEntity({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<PaymentEntity>) {
      Object.assign(this, partial);
  }
}