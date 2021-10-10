export type FilterOperators = "=" | "!=" | ">" | ">=" | "<" | "<=";

export type FilterExpression<NAME extends string = string, OPERATOR extends FilterOperators = FilterOperators, VALUE = any> = [NAME, OPERATOR, VALUE];

export type FE<NAME extends string = string, OPERATOR extends FilterOperators = FilterOperators, VALUE = any> = FilterExpression<NAME, OPERATOR, VALUE>;

export type SortExpression<NAME extends string> = `${NAME}` | `+${NAME}` | `-${NAME}`;
