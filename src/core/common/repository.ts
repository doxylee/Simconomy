import { Entity } from "@core/common/entity";
import { F } from "@core/common/F";

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

export type EntityBasicFilterExpression = FE<"id", FilterOperators, string>;

export type EntityBasicSortableFields = "id";

export interface Repository<E extends Entity, FES extends FilterExpression<Extract<keyof E, string>>, SS extends Extract<keyof E, string>> {
    entityType: string;

    // TODO: Should save() be defined in Repository interface?
    // save(params?: { saveAs?: string }): Promise<void>;

    /**
     * Add an entity to the repository.
     *
     * @param entity
     * @throws ConflictException
     */
    create(entity: E): Promise<E>;

    /**
     * Find an entity by its id.
     *
     * @param id
     * @throws EntityNotFoundException
     */
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
     * @param params.showTotal - Whether to get total number of entities that match filter conditions.
     */
    query<C extends boolean = true>(params?: {
        filter?: (FES | EntityBasicFilterExpression)[];
        sort?: SortExpression<SS | EntityBasicSortableFields>[];
        limit?: number | null;
        offset?: number;
        showTotal?: C;
    }): Promise<C extends false ? E[] : E[] & { total: number }>;

    query(params?: {
        filter?: (FES | EntityBasicFilterExpression)[];
        sort?: SortExpression<SS | EntityBasicSortableFields>[];
        limit?: number | null;
        offset?: number;
        showTotal?: boolean;
    }): Promise<E[] & { total?: number }>;

    /**
     * Update an entity.
     * Parameter object must have an `id` parameter which designates which entity to update.
     * Other properties of the parameter is overwritten to the target entity.
     * `F` instance can be used as the property value.
     *
     * @param entity
     * @throws EntityNotFoundException
     */
    update(entity: { [K in keyof E]?: E[K] | F<E[K]> } & { id: string }): Promise<E>;

    /**
     * Delete and entity by its id.
     *
     * @param id
     * @throws EntityNotFoundException
     */
    delete(id: string): Promise<void>;
}