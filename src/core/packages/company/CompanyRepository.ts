import { FE, FilterOperators, Repository } from "@core/common/repository";
import { Company } from "@core/packages/company/Company";
import { BigNumber } from "@core/common/BigNumber";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";

type CompanyFilterExpressions = FE<"name", "=" | "!=", string> | FE<"cash", FilterOperators, BigNumber>;

type CompanySortableFields = "name" | "cash";

export interface CompanyRepository extends Repository<Company, CompanyFilterExpressions, CompanySortableFields> {}

export class CompanyIDBMemoryHybridRepository extends IDBMemoryHybridRepository<Company, CompanyFilterExpressions, CompanySortableFields> {
    entityType: "Company" = "Company";
}
