import { Injectable } from '@nestjs/common';
import { ReservationResponseCommand } from '../../app/commands';
import { ReservationRequestModel } from '../models';
import { EntityManager } from 'typeorm';

interface ReservationServiceInterface {
  reserve(model: ReservationRequestModel, manager?:EntityManager): Promise<ReservationResponseCommand>
  reservation(model: ReservationRequestModel, manager?:EntityManager): Promise<ReservationResponseCommand>
  book(model: ReservationRequestModel, manager?:EntityManager): Promise<ReservationResponseCommand>
  reservedItems(model: ReservationRequestModel, manager?:EntityManager): Promise<ReservationResponseCommand>
}

@Injectable()
export abstract class AbstractReservationService implements ReservationServiceInterface {
  abstract reserve(model: ReservationRequestModel, manager?:EntityManager): Promise<ReservationResponseCommand>
  abstract reservation(model: ReservationRequestModel, manager?:EntityManager): Promise<ReservationResponseCommand>
  abstract book(model: ReservationRequestModel, manager?:EntityManager): Promise<ReservationResponseCommand>
  abstract reservedItems(model: ReservationRequestModel, manager?:EntityManager): Promise<ReservationResponseCommand>
}
