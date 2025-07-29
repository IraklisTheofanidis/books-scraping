import { PoolClient } from "pg";

export const getCategoryIdByTitle = async (
    dbClient: PoolClient,
    title: string
): Promise<number | null> => {
    const result = await dbClient.query<{ id: number }>(
        'SELECT id FROM categories WHERE title = $1 LIMIT 1',
        [title]
    );

    return result.rows[0]?.id ?? null;
};

export const getCategoryIdByUrlToScrape = async (
    dbClient: PoolClient,
    urlToScrape: string
): Promise<number | null> => {
    const result = await dbClient.query<{ id: number }>(
        'SELECT id FROM categories WHERE scraped_url = $1 LIMIT 1',
        [urlToScrape]
    );

    return result.rows[0]?.id ?? null;
};

export const getCategoryIdByUuid = async (dbClient: PoolClient, uuid: string): Promise<number | null> => {
    const result = await dbClient.query<{ id: number }>('SELECT id FROM categories WHERE uuid = $1 LIMIT 1', [uuid])

    return result.rows[0]?.id ?? null;
}