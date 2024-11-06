import { Injectable } from '@nestjs/common';
import { ConcertRequestModel } from '../models';
import { ConcertPlanResponseCommand, ConcertResponseCommand, ConcertTicketResponseCommand } from '../../app/commands';
import { EntityManager } from 'typeorm';

interface ConcertServiceInterface  {
  reservableDates(model:ConcertRequestModel, manager?: EntityManager): Promise<ConcertResponseCommand[]>
  reservableSeats(model:ConcertRequestModel, manager?: EntityManager): Promise<ConcertResponseCommand>
}

@Injectable()
export abstract class AbstractConcertService implements ConcertServiceInterface {
  abstract reservableDates(model:ConcertRequestModel, manager?: EntityManager): Promise<ConcertResponseCommand[]>
  abstract reservableSeats(model:ConcertRequestModel, manager?: EntityManager): Promise<ConcertResponseCommand>
} 