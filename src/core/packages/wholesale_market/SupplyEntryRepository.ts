import { FE, FilterOperators, Repository } from "@core/common/repository";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";
import { SupplyEntry, SupplyEntryStatus } from "@core/packages/wholesale_market/SupplyEntry";
import { FirmType } from "@core/common/FirmType";
import BigNumber from "@core/common/BigNumber";

export type SupplyEntryFilterExpressions =
    | FE<"companyId", "=" | "!=", string>
    | FE<"firmType", "=" | "!=", FirmType>
    | FE<"firmId", "=" | "!=", string>
    | FE<"itemGroupId", "=" | "!=", string>
    | FE<"productId", "=" | "!=", string>
    | FE<"stockAmount", FilterOperators, BigNumber>
    | FE<"price", FilterOperators, BigNumber>
    | FE<"status", "=" | "!=", SupplyEntryStatus>;

export type SupplyEntrySortableFields = Exclude<keyof SupplyEntry, "EntityType" | "clone">;

export interface SupplyEntryRepository extends Repository<SupplyEntry, SupplyEntryFilterExpressions, SupplyEntrySortableFields> {}

export class SupplyEntryIDBMemoryHybridRepository extends IDBMemoryHybridRepository<
    SupplyEntry,
    SupplyEntryFilterExpressions,
    SupplyEntrySortableFields
> {}