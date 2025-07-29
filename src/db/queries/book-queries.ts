import { PoolClient } from "pg";
import { Book } from "../models/book";

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

export const getBooksQuery = async (dbClient: PoolClient, categoryId: number | null): Promise<Book[]> => {
    let query = 'SELECT * FROM books';
    const params: any[] = [];
    const conditions: string[] = [];

    if (categoryId) {
        conditions.push(`category_id = $${params.length + 1}`);
        params.push(categoryId);
    }

    // Add WHERE clause if there are any filters
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await dbClient.query<Book>(query, params);
    return result.rows;
}
