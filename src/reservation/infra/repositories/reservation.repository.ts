import { Injectable } from "@nestjs/common";
import { EntityManager, In, Not } from "typeorm";
import { ReservationRequestEntity, ReservationEntity } from "../entities";
import { AbstractReservationRepository } from "../../domain/repository.interfaces";
import { ReservationResponseModel } from "../../domain/models"

@Injectable()
export class ReservationRepository implements AbstractReservationRepository {
  
  async reserve(reservationEntity:ReservationEntity, manager: EntityManager): Promise<void> {
    manager.update(
      ReservationEntity,
      { 
        mainCategory: reservationEntity.mainCategory,
        subCategory: reservationEntity.subCategory,
        minorCategory: reservationEntity.minorCategory,
        version: reservationEntity.version,
      },
      {
        status: reservationEntity.status,
        userId: reservationEntity.userId,
        version: reservationEntity.version+1,
      },
    );
  }

  async reservedItems(reservatioEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel[]> {
    return ReservationResponseModel.of(await manager.find(ReservationEntity, 
      { where: {
          mainCategory: reservatioEntity.mainCategory,
          subCategory: reservatioEntity.subCategory,
          minorCategory: In([ 'temp', 'confirmed' ]),
        }
      } 
    ));
  }

  async updateStatus(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel> {
    await manager.update(ReservationEntity,
      { id: reservationEntity.id }, 
      { status: reservationEntity.status }
    )

    return ReservationResponseModel.of(await manager.findOne(ReservationEntity,{where: {id: reservationEntity.id}}));
  }
  
  async updateStatuses(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<void> {
    await manager.update(ReservationEntity,
      { id: In(reservationEntity.ids) }, 
      { status: reservationEntity.status }
    )
  }
  
  /*
  async item(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel> {
    const reservation = await manager
        .createQueryBuilder(ReservationEntity, "reservation")
        .setLock("pessimistic_write") // 비관적 락 설정
        .where("reservation.mainCategory = :mainCategory", { mainCategory: reservationEntity.mainCategory })
        .andWhere("reservation.subCategory = :subCategory", { subCategory: reservationEntity.subCategory })
        .andWhere("reservation.minorCategory = :minorCategory", { minorCategory: reservationEntity.minorCategory })
        .andWhere("reservation.status = :status", { status: reservationEntity.status })
        .getOne();
    return reservation === null ? null : ReservationResponseModel.of(reservation);
  }
  */
  
  async item(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel> {
    return ReservationResponseModel.of(await manager.findOne(ReservationEntity,
      { where : {
          mainCategory: reservationEntity.mainCategory,
          subCategory: reservationEntity.subCategory,
          minorCategory: reservationEntity.minorCategory,
          status: reservationEntity.status
        }
      }
    ));
  }

  async itemsByStatus(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseModel[]> {
    return ReservationResponseModel.of(
      await manager.find(ReservationEntity,
        { where : {
            status: Not(reservationEntity.status)
          }
        }
      )
    );
  }

}
