import { ConflictException, EntityNotFoundException, UnexpectedError } from "@core/common/exceptions";
import { Entity } from "@core/common/entity";
import { FilterExpression, SortExpression } from "@core/common/repository";

const DEFAULT_QUERY_LIMIT = 20;

export class IDBMemoryHybridRepository<E extends Entity, FE extends FilterExpression<keyof Entity>, S extends Extract<keyof E, string>> {
    gameId: string;
    entityType: string = "";
    store: Record<string, E>;

    constructor({ gameId }: { gameId: string }) {
        this.gameId = gameId;
        this.store = {};
    }

    static open({ gameId }: { gameId: string }) {
        const repository = new this({ gameId });
        throw "Not implemented";
    }

    save(params?: { saveAs?: string }) {
        throw "Not implemented";
    }

    create(entity: E) {
        if (this.store[entity.id]) throw new ConflictException({ reason: "Entity with same id already exists." });
        this.store[entity.id] = entity;
    }

    read(id: string) {
        const found = this.store[id];
        if (found === undefined) throw new EntityNotFoundException({ entityType: this.entityType, entityId: id });
        return found;
    }

    /**
     * Get entities which match filter conditions in requested order, limit, offset.
     * Also get total number of entities that matches filter conditions.
     * @param params
     * @param params.filter - Conditions to filter entities.
     * @param params.sort - Which fields to sort result with.
     * @param params.limit - Max number of entities to get.
     * @param params.offset - Offset of entities to get
     * @param params.count - Whether to get total number of entities that match filter conditions.
     */
    query<C extends boolean = true>(params?: {
        filter?: FE[];
        sort?: SortExpression<S>[];
        limit?: number | null;
        offset?: number;
        count?: C;
    }): C extends false ? E[] : E[] & { total: number };
    query({
        filter,
        sort,
        limit = DEFAULT_QUERY_LIMIT,
        offset = 0,
        count = true,
    }: {
        filter?: FE[];
        sort?: SortExpression<S>[];
        limit?: number | null;
        offset?: number;
        count?: boolean;
    } = {}): E[] & { total?: number } {
        let entities = Object.values(this.store);
        
        // Filter if requested
        if (filter) {
            const filterFunc = (e: E) =>
                filter?.every(([name, op, val]) => {
                    // TODO: change switch to Record<operator, callback>
                    switch (op) {
                        case "=":
                            return e[name] === val;
                        case "!=":
                            return e[name] !== val;
                        case ">":
                            return e[name] > val;
                        case ">=":
                            return e[name] >= val;
                        case "<":
                            return e[name] < val;
                        case "<=":
                            return e[name] <= val;
                        default:
                            throw new UnexpectedError({ reason: `Unknown filter operation '${op}' requested.` });
                    }
                });
            entities = entities.filter(filterFunc);
        }
        const totalCount = entities.length;
        
        // When only total count is needed, return right after filter
        if(limit === 0){
            // If even total count is not needed, return empty array.
            if(!count) return [];
            
            const result: E[] & { total: number } = [] as unknown as E[] & { total: number };
            result.total = totalCount;
            return result;
        }
        
        // Sort if needed
        if (sort) {
            const parsedSort = sort.map((s): { asc: 1 | -1; name: keyof E } => ({
                asc: s.charAt(0) !== "-" ? -1 : 1,
                name: (s.charAt(0) === "+" || s.charAt(0) === "-" ? s.slice(1) : s) as keyof E,
            }));

            const sortFunc = (e1: E, e2: E) => {
                for (const { asc, name } of parsedSort) {
                    if (e1[name] > e2[name]) return asc;
                    if (e1[name] < e2[name]) return -asc;
                }
                return 0;
            };
            entities.sort(sortFunc);
        }
        
        // If limit is needed
        if(limit !== null){
            entities = entities.slice(offset, offset + limit)
        }
        
        // If no limit but offset exists, apply offset
        else if(offset){
            entities = entities.slice(offset)
        }
        
        if(!count) return entities; // Return only array if count is not needed.
        
        const result: E[] & { total: number } = entities as E[] & { total: number };
        result.total = totalCount;
        return result;
    }

    update(entity: Partial<E> & { id: string }) {
        const found = this.store[entity.id];
        if (!found) throw new EntityNotFoundException({ entityType: this.entityType, entityId: entity.id });
        this.store[entity.id] = { ...found, ...entity };
    }

    delete(id: string) {
        if (!this.store[id]) throw new EntityNotFoundException({ entityType: this.entityType, entityId: id });
        delete this.store[id];
    }
}