import { Injectable } from "@nestjs/common";
import { ReservationRequestEntity, ReservationEntity } from "../../infra/entities";
import { ReservationResponseModel } from "../../domain/models";
import { EntityManager } from "typeorm";

interface ReservationRepositoryInterface{
    reserve(reservationEntity: ReservationEntity, manager: EntityManager): Promise<void>
    reservedItems(reservatioEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel[]>
    item(reservatioEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel>
    updateStatus(reservationEntity: ReservationEntity, manager: EntityManager): Promise<number>
    updateStatuses(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<void>
    itemsByStatus(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel[]>
}

@Injectable()
export abstract class AbstractReservationRepository implements ReservationRepositoryInterface{
    abstract reserve(reservationEntity: ReservationEntity, manager: EntityManager): Promise<void>
    abstract reservedItems(reservatioEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel[]>
    abstract item(reservatioEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel>
    abstract updateStatus(reservationEntity: ReservationEntity, manager: EntityManager): Promise<number>
    abstract updateStatuses(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<void>
    abstract itemsByStatus(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel[]>
}