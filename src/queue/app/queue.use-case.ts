import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { QueuePostResponseDto as ResPostDto, QueueGetResponseDto as ResGetDto } from "../pres/dto";
import { AbstractQueueService } from '../domain/service.interfaces';
import { QueueRequestCommand } from './commands';
import { QueueRequestModel } from '../domain/models';

@Injectable()
export class QueueUsecase {

    constructor(
        private readonly queueService: AbstractQueueService,
        private readonly dataSource: DataSource,
    ) {}

    async enter(command: QueueRequestCommand): Promise<ResPostDto> {
        const model = QueueRequestModel.of(command);
        const enterResult = await this.queueService.enter(model);

        return ResPostDto.of(enterResult);
    }

    async myPosition(command: QueueRequestCommand): Promise<ResGetDto> {
        return ResGetDto.of(await this.queueService.position(QueueRequestModel.of(command)));
    }
    
}
