import { Repository } from "@core/common/repository";
import { IDBMemoryHybridRepository } from "@core/utils/IDBMemoryHybridRepository";
import { GlobalState } from "@core/systems/GlobalStateContainer/GlobalState";

type GlobalStateFilterExpressions = never;

type GlobalStateSortableFields = never;

export interface GlobalStateRepository extends Repository<GlobalState, GlobalStateFilterExpressions, GlobalStateSortableFields> {}

export class GlobalStateIDBMemoryHybridRepository extends IDBMemoryHybridRepository<
    GlobalState,
    GlobalStateFilterExpressions,
    GlobalStateSortableFields
> {}
