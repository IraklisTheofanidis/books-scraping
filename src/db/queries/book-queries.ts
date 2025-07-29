import { PoolClient } from "pg";
import { Book, BookFilterParams } from "../models/book";

export const getBookByUuid = async (
    dbClient: PoolClient,
    uuid: string,
): Promise<Book | null> => {
    const result = await dbClient.query<Book>(
        'SELECT * FROM books WHERE uuid = $1 LIMIT 1',
        [uuid]
    );

    return result.rows[0] ?? null;
};

export const getBooksQuery = async (dbClient: PoolClient, filters: BookFilterParams): Promise<Book[]> => {
    let query = 'SELECT COUNT(*) FROM books';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.categoryId) {
        conditions.push(`category_id = $${params.length + 1}`);
        params.push(filters.categoryId);
    }

    if (filters.price) {
        conditions.push(`price = $${params.length + 1}`);
        params.push(filters.price);
    } else if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        // Both min and max → BETWEEN
        conditions.push(`price BETWEEN $${params.length + 1} AND $${params.length + 2}`);
        params.push(filters.minPrice, filters.maxPrice);
    } else if (filters.minPrice !== undefined) {
        // Only min → greater than or equal
        conditions.push(`price >= $${params.length + 1}`);
        params.push(filters.minPrice);
    } else if (filters.maxPrice !== undefined) {
        // Only max → less than or equal
        conditions.push(`price <= $${params.length + 1}`);
        params.push(filters.maxPrice);
    }

    if (filters.stock) {
        conditions.push(`in_stock = $${params.length + 1}`);
        params.push(filters.stock);
    } else if (filters.minStock !== undefined && filters.maxStock !== undefined) {
        // Both min and max → BETWEEN
        conditions.push(`in_stock BETWEEN $${params.length + 1} AND $${params.length + 2}`);
        params.push(filters.minStock, filters.maxStock);
    } else if (filters.minStock !== undefined) {
        // Only min → greater than or equal
        conditions.push(`in_stock >= $${params.length + 1}`);
        params.push(filters.minStock);
    } else if (filters.maxStock !== undefined) {
        // Only max → less than or equal
        conditions.push(`in_stock <= $${params.length + 1}`);
        params.push(filters.maxStock);
    }


    // Add WHERE clause if there are any filters
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await dbClient.query<Book>(query, params);
    return result.rows;
}
