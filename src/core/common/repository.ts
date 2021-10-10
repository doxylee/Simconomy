import { Entity } from "@core/common/entity";

export type FilterOperators = "=" | "!=" | ">" | ">=" | "<" | "<=";

export type FilterExpression<NAME extends string = string, OPERATOR extends FilterOperators = FilterOperators, VALUE = any> = [
    NAME,
    OPERATOR,
    VALUE
];

export type FE<NAME extends string = string, OPERATOR extends FilterOperators = FilterOperators, VALUE = any> = FilterExpression<
    NAME,
    OPERATOR,
    VALUE
>;

export type SortExpression<NAME extends string> = `${NAME}` | `+${NAME}` | `-${NAME}`;

export interface Repository<E extends Entity, FES extends FilterExpression<Extract<keyof E, string>>, SS extends Extract<keyof E, string>> {
    entityType: string;

    save(params?: { saveAs?: string }): Promise<void>;

    create(entity: E): Promise<void>;

    read(id: string): Promise<E>;

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
    query<C extends boolean = true>(params?: {
        filter?: FES[];
        sort?: SortExpression<SS>[];
        limit?: number | null;
        offset?: number;
        count?: C;
    }): Promise<C extends false ? E[] : E[] & { total: number }>;

    query(params?: {
        filter?: FES[];
        sort?: SortExpression<SS>[];
        limit?: number | null;
        offset?: number;
        count?: boolean;
    }): Promise<E[] & { total?: number }>;

    update(entity: Partial<E> & { id: string }): Promise<void>;

    delete(id: string): Promise<void>;
}