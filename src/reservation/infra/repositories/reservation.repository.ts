import { Injectable } from "@nestjs/common";
import { EntityManager, In, Not } from "typeorm";
import { ReservationRequestEntity, ReservationEntity } from "../entities";
import { AbstractReservationRepository } from "../../domain/repository.interfaces";
import { ReservationResponseCommand } from "../../app/commands"

@Injectable()
export class ReservationRepository implements AbstractReservationRepository {
  
  async reserve(reservationEntity:ReservationEntity, manager: EntityManager): Promise<ReservationResponseCommand> {
    return ReservationResponseCommand.of(await manager.save(reservationEntity));
  }

  async reservedItems(reservatioEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseCommand[]> {
    return ReservationResponseCommand.of(await manager.find(ReservationEntity, 
      { where: {
          mainCategory: reservatioEntity.mainCategory,
          subCategory: reservatioEntity.subCategory,
          minorCategory: In([ 'temp', 'confirmed' ]),
        }
      } 
    ));
  }

  async updateStatus(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseCommand> {
    await manager.update(ReservationEntity,
      { id: reservationEntity.id }, 
      { status: reservationEntity.status }
    )

    return ReservationResponseCommand.of(await manager.findOne(ReservationEntity,{where: {id: reservationEntity.id}}));
  }
  
  async updateStatuses(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<void> {
    await manager.update(ReservationEntity,
      { id: In(reservationEntity.ids) }, 
      { status: reservationEntity.status }
    )
  }
  
  async reservedItem(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseCommand> {
    return ReservationResponseCommand.of(await manager.findOne(ReservationEntity,
      { where : {
          mainCategory: reservationEntity.mainCategory,
          subCategory: reservationEntity.subCategory,
          minorCategory: reservationEntity.minorCategory,
          status: Not('expired')
        }
      }
    ));
  }

  async itemsByStatus(reservationEntity: ReservationRequestEntity, manager: EntityManager): Promise<ReservationResponseCommand[]> {
    return ReservationResponseCommand.of(
      await manager.find(ReservationEntity,
        { where : {
            status: Not(reservationEntity.status)
          }
        }
      )
    );
  }
}
