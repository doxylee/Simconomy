export type FilterOperator = "=" | "!=" | ">" | ">=" | "<" | "<=";

export type FilterExpression<NAME extends string = string, OPERATOR extends FilterOperator = FilterOperator, VALUE = any> = [NAME, OPERATOR, VALUE];

export type SortExpression<NAME extends string> = `${NAME}` | `+${NAME}` | `-${NAME}`;
