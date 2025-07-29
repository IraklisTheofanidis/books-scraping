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
