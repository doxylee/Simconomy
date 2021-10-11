import { ConflictException, EntityNotFoundException, UnexpectedError } from "@core/common/exceptions";
import { Entity } from "@core/common/entity";
import { EntityBasicFilterExpression, FilterExpression, Repository, SortExpression } from "@core/common/repository";
import cloneDeep from "lodash/cloneDeep";
import { arrayWithTotal } from "@core/utils/arrayWithTotal";
import { F } from "@core/common/F";
import BigNumber from "@core/common/BigNumber";

const DEFAULT_QUERY_LIMIT = 20;

export class IDBMemoryHybridRepository<
    E extends Entity,
    FES extends FilterExpression<Extract<keyof E, string>>,
    SS extends Extract<keyof E, string>
> implements Repository<E, FES, SS>
{
    gameId: string;
    entityType: string = "NOT SPECIFIED IN REPOSITORY";
    store: Record<string, E>;

    constructor({ gameId }: { gameId: string }) {
        this.gameId = gameId;
        this.store = {};
    }

    static async open({ gameId }: { gameId: string }) {
        const repository = new this({ gameId });
        throw "Not implemented";
    }

    async save(params?: { saveAs?: string }) {
        throw "Not implemented";
    }

    async create(entity: E) {
        if (this.store[entity.id]) throw new ConflictException({ reason: "Entity with same id already exists." });
        this.store[entity.id] = cloneDeep(entity);
        return cloneDeep(entity);
    }

    async read(id: string) {
        const found = this.store[id];
        if (found === undefined) throw new EntityNotFoundException({ entityType: this.entityType, entityId: id });
        return cloneDeep(found);
    }

    /**
     * Get entities which match filter conditions in requested order, limit, offset.
     * Also get total number of entities that matches filter conditions.
     *
     * WARNING: null acts like 0 when compared, sorted with number, BigNumber values.
     *
     * @param params
     * @param params.filter - Conditions to filter entities.
     * @param params.sort - Which fields to sort result with.
     * @param params.limit - Max number of entities to get. Set to null to set no limit. Defaults to 20(DEFAULT_QUERY_LIMIT) if not specified.
     * @param params.offset - Offset of entities to get
     * @param params.count - Whether to get total number of entities that match filter conditions.
     */
    async query<C extends boolean = true>(params?: {
        filter?: (FES | EntityBasicFilterExpression)[];
        sort?: SortExpression<SS>[];
        limit?: number | null;
        offset?: number;
        count?: C;
    }): Promise<C extends false ? E[] : E[] & { total: number }>;
    async query({
        filter,
        sort,
        limit = DEFAULT_QUERY_LIMIT,
        offset = 0,
        count = true,
    }: {
        filter?: (FES | EntityBasicFilterExpression)[];
        sort?: SortExpression<SS>[];
        limit?: number | null;
        offset?: number;
        count?: boolean;
    } = {}): Promise<E[] & { total?: number }> {
        let entities = Object.values(this.store);

        // Filter if requested
        if (filter) {
            const filterFunc = (e: E) =>
                filter?.every(([name, op, val]) => {
                    // TODO: change switch to Record<operator, callback>
                    // TODO: use BigNumber.comparedTo method for 4 times faster execution
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
        if (limit === 0) {
            // If total count is also not needed (calling query was pointless), return empty array.
            // TODO: show warning log
            if (!count) return [];

            return arrayWithTotal([], totalCount);
        }

        // Sort if needed
        if (sort) {
            const parsedSort = sort.map((s): { asc: 1 | -1; name: keyof E } => ({
                asc: s.charAt(0) !== "-" ? 1 : -1,
                name: (s.charAt(0) === "+" || s.charAt(0) === "-" ? s.slice(1) : s) as keyof E,
            }));

            const sortFunc = (e1: E, e2: E) => {
                for (const { asc, name } of parsedSort) {
                    // TODO: use BigNumber.comparedTo method for 4 times faster execution
                    if (e1[name] > e2[name]) return asc;
                    if (e1[name] < e2[name]) return -asc;
                }
                return 0;
            };
            entities.sort(sortFunc);
        }

        // If limit is needed
        if (limit !== null) {
            entities = entities.slice(offset, offset + limit);
        }

        // If no limit but offset exists, apply offset
        else if (offset) {
            entities = entities.slice(offset);
        }

        if (!count) return entities.map((e) => cloneDeep(e)); // Return only array if count is not needed.

        return arrayWithTotal(
            entities.map((e) => cloneDeep(e)),
            totalCount
        );
    }

    async update(entity: { [K in keyof E]?: E[K] | F<E[K]> } & { id: string }) {
        const found = this.store[entity.id];
        if (!found) throw new EntityNotFoundException({ entityType: this.entityType, entityId: entity.id });

        const updated = {
            ...found,
            ...Object.fromEntries(
                Object.entries(entity).map(([k, v]) => {
                    if (v instanceof F) {
                        // @ts-ignore
                        const orig = found[k];
                        if (orig instanceof BigNumber) {
                            // @ts-ignore
                            return [k, orig.plus(v.add)];
                            // TODO: bignumber F expression only works if original value and adding value is BigNumber
                        }
                        return [k, orig + v.add];
                        // TODO: only supports F.add expression.
                    }
                    return [k, v];
                })
            ),
        };
        this.store[entity.id] = updated;
        return cloneDeep(updated);
    }

    async delete(id: string) {
        if (!this.store[id]) throw new EntityNotFoundException({ entityType: this.entityType, entityId: id });
        delete this.store[id];
    }
}