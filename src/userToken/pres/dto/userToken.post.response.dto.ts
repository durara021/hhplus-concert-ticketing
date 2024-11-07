import { ApiProperty } from "@nestjs/swagger";

type Part = Partial<UserTokenPostResponseDto>;

export class UserTokenPostResponseDto {
  @ApiProperty({ description: 'userToken' })
  userToken: string;

  // of 메서드: Partial 타입을 이용해 객체를 생성
  static of(partial: Part): UserTokenPostResponseDto;
  static of(partial: Part[]): UserTokenPostResponseDto[];
  static of(
    partial: Part | Part[]
  ): UserTokenPostResponseDto | UserTokenPostResponseDto[] {
    if(Array.isArray(partial)) return partial.map(partial => this.of(partial));
    return new UserTokenPostResponseDto({ ...partial });
  }

  // 생성자에서 전개 연산자를 사용해 필드 초기화
  constructor(partial: Partial<UserTokenPostResponseDto>) {
    Object.assign(this, partial);
  }
}