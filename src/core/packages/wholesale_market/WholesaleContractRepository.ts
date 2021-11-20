import { FE, FilterOperators, Repository } from "@core/common/repository";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";
import { WholesaleContract, WholesaleContractStatus } from "@core/packages/wholesale_market/WholesaleContract";
import { FirmType } from "@core/common/FirmType";
import { BigNumber } from "@core/common/BigNumber";

type WholesaleContractFilterExpressions =
    | FE<"supplyEntryId", "=" | "!=", string>
    | FE<"supplyCompanyId", "=" | "!=", string>
    | FE<"supplyFirmType", "=" | "!=", FirmType>
    | FE<"supplyFirmId", "=" | "!=", string>
    | FE<"productId", "=" | "!=", string>
    | FE<"buyerFirmType", "=" | "!=", FirmType>
    | FE<"buyerFirmId", "=" | "!=", string>
    | FE<"amount", FilterOperators, BigNumber>
    | FE<"startPrice", FilterOperators, BigNumber>
    | FE<"priceIncreaseLimit", FilterOperators, BigNumber>
    | FE<"status", "=" | "!=", WholesaleContractStatus>;

type WholesaleContractSortableFields = Exclude<keyof WholesaleContract, "EntityType">;

export interface WholesaleContractRepository
    extends Repository<WholesaleContract, WholesaleContractFilterExpressions, WholesaleContractSortableFields> {}

export class WholesaleContractIDBMemoryHybridRepository extends IDBMemoryHybridRepository<
    WholesaleContract,
    WholesaleContractFilterExpressions,
    WholesaleContractSortableFields
> {
    entityType: "WholesaleContract" = "WholesaleContract";
}
