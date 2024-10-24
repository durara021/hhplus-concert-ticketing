import { ApiProperty } from "@nestjs/swagger";

export class QueuePostResponseDto {
    @ApiProperty({ description: '대기열 순번' })
    position: number;
    @ApiProperty({ description: '상태' })
    status: string;

    constructor(
        position: number,
        status: string,
    ) {
        this.position = position;
        this.status = status;
    }
}
