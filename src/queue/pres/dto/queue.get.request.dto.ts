import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

type Part = Partial<QueueGetRequestDto>;

export class QueueGetRequestDto {
  @ApiProperty({ description: '유저 id' })
  @IsInt()
  userId: number;

  // of 메서드: Partial 타입을 이용해 객체를 생성

  static of(partial: Part): QueueGetRequestDto;
  static of(partial: Part[]): QueueGetRequestDto[];
  static of(
    partial: Part | Part[]
  ): QueueGetRequestDto | QueueGetRequestDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new QueueGetRequestDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<QueueGetRequestDto>) {
      Object.assign(this, partial);
  }
}