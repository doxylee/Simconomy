import { FE, FilterOperators, Repository } from "@core/common/repository";
import { BigNumber } from "@core/common/BigNumber";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";
import { Factory } from "@core/packages/factory/Factory";

type FactoryFilterExpressions = FE<"companyId", "=" | "!=", string> | FE<"size", FilterOperators, BigNumber>;

type FactorySortableFields = "companyId" | "size";

export interface FactoryRepository extends Repository<Factory, FactoryFilterExpressions, FactorySortableFields> {}

export class FactoryIDBMemoryHybridRepository extends IDBMemoryHybridRepository<Factory, FactoryFilterExpressions, FactorySortableFields> {
    entityType: "Factory" = "Factory";
}
