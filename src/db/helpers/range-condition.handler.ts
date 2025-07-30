export function addRangeCondition<
    T extends Record<string, any>, // filters must be an object
    K1 extends keyof T,        // field must be a valid key of filters etc. price
    K2 extends keyof T,             // minField must be a valid key of filters etc. minPrice
    K3 extends keyof T              // field must be a valid key of filters etc. maxPrice
>(
    column: string,
    field: K1,
    minField: K2,
    maxField: K3,
    filters: T,
    conditions: string[],
    params: any[]
): void {
    if (filters[field] !== undefined) {
        conditions.push(`${column} = $${params.length + 1}`);
        params.push(filters[field]);
    } else if (
        filters[`${String(minField)}` as keyof T] !== undefined &&
        filters[`${String(maxField)}` as keyof T] !== undefined
    ) {
        conditions.push(`${column} BETWEEN $${params.length + 1} AND $${params.length + 2}`);
        params.push(
            filters[`${String(minField)}` as keyof T],
            filters[`${String(maxField)}` as keyof T]
        );
    } else if (filters[`${String(minField)}` as keyof T] !== undefined) {
        conditions.push(`${column} >= $${params.length + 1}`);
        params.push(filters[`${String(minField)}` as keyof T]);
    } else if (filters[`${String(maxField)}` as keyof T] !== undefined) {
        conditions.push(`${column} <= $${params.length + 1}`);
        params.push(filters[`${String(maxField)}` as keyof T]);
    }
}