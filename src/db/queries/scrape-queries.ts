import { PoolClient } from "pg";
import { ScrapeBook, ScrapeDatabase, ScrapeUrl } from "../models/scrape";
import { Category } from "../models/category";
import { Book } from "../models/book";

// if already exists, returns null
export const addScrapedCategory = async (dbClient: PoolClient, title: string, urlToScrape?: string): Promise<Category | null> => {
    const response = await dbClient.query<Category>(
        `INSERT INTO categories (title, scraped_url)
        VALUES ($1, $2)
        ON CONFLICT (title) DO NOTHING
        RETURNING *`,
        [title, urlToScrape ?? null]
    );
    return response.rows[0]
}

// if already exists, returns null
export const addScrapedBook = async (dbClient: PoolClient, book: ScrapeBook, categoryId: number): Promise<Book | null> => {
    const response = await dbClient.query<Book>(
        `INSERT INTO books (title, price, in_stock, rating, description, img_src, scraped_url, category_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (title, category_id) DO NOTHING
        RETURNING *`,
        [book.title, book.price, book.inStock, book.rating, book.description, book.imgSrc, book.scrapedUrl, categoryId])
    return response.rows[0];
}
