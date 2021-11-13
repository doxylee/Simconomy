import { FE, FilterOperators, Repository } from "@core/common/repository";
import { BigNumber } from "@core/common/BigNumber";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";
import { Shop } from "@core/packages/shop/Shop";

type ShopFilterExpressions = FE<"companyId", "=" | "!=", string> | FE<"size", FilterOperators, BigNumber>;

type ShopSortableFields = "companyId" | "size";

export interface ShopRepository extends Repository<Shop, ShopFilterExpressions, ShopSortableFields> {}

export class ShopIDBMemoryHybridRepository extends IDBMemoryHybridRepository<Shop, ShopFilterExpressions, ShopSortableFields> {}
