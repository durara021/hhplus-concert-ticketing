import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

type Part = Partial<QueuePostRequestDto>;

export class QueuePostRequestDto {
  @ApiProperty({ description: '유저 id' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: '세션 UUID' })
  @IsString()
  uuid: string;

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): QueuePostRequestDto;
  static of(partial: Part[]): QueuePostRequestDto[];
  static of(
    partial: Part | Part[]
  ): QueuePostRequestDto | QueuePostRequestDto[] {
      if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
      return new QueuePostRequestDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<QueuePostRequestDto>) {
      Object.assign(this, partial);
  }
  
}