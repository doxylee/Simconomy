import { FE, Repository } from "@core/common/repository";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";
import { LocalSupplier } from "@core/packages/local_supplier/LocalSupplier";

type LocalSupplierFilterExpressions = FE<"companyId", "=" | "!=", string> | FE<"itemId", "=" | "!=", string>;

type LocalSupplierSortableFields = "companyId" | "itemId";

export interface LocalSupplierRepository extends Repository<LocalSupplier, LocalSupplierFilterExpressions, LocalSupplierSortableFields> {}

export class LocalSupplierIDBMemoryHybridRepository extends IDBMemoryHybridRepository<
    LocalSupplier,
    LocalSupplierFilterExpressions,
    LocalSupplierSortableFields
> {}
