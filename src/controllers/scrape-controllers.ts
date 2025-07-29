import { Request, Response } from "express";
import { Browser, Page } from 'puppeteer';
import { sendErrorMailToAdmins } from "../db/helpers/mailer.handler";
import { closeBrowser, closePage, initializeBrowser, InitializePage } from "../db/helpers/puppeteer.handler";
import { scrapeCategoriesHandler, scrapeCategoryBooksHandler } from "../db/helpers/scrape-handler";
import { sleep } from "../db/helpers/timers";
import { ApiResponse } from "../db/models/ApiResponse";
import { ScrapeBook, ScrapeDatabase, ScrapeUrl } from "../db/models/scrape";
import { scrapeBookHandler } from './../db/helpers/scrape-handler';
import db from "../db/database";
import { addAllScrapedCategoriesToDatabase, addAllScrapedDataToDatabase } from "../db/helpers/scrape-data-to-database-handler";
import { addScrapedBook, addScrapedCategory,  } from "../db/queries/scrape-queries";
import { Category } from "../db/models/category";
import { Book } from "../db/models/book";
import { getCategoryIdByTitle, getCategoryIdByUrlToScrape } from "../db/queries/category-queries";

export async function scrapeBook(req: Request, res: Response): Promise<ApiResponse<Book>> {
    let urlToScrape = req.body?.urlToScrape as string;
    if (!urlToScrape) throw new Error('urlToScrape is required');
    const dbClient = await db.pool.connect();

    let browser: Browser | undefined = undefined;
    let page: Page | undefined = undefined;
    try {
        browser = await initializeBrowser();
        if (!browser) throw new Error('Failed to load browser');

        page = await InitializePage(browser, urlToScrape);

        if (!page) throw new Error('Failed to load page');

        const book = await scrapeBookHandler(page, urlToScrape);
        if (!book) throw new Error('Failed to scrape book');
        dbClient.query('BEGIN');
        const categoryName = book.categoryName;
        let categoryId = await getCategoryIdByTitle(dbClient, categoryName);
        if (!categoryId) {
            const category = (await addScrapedCategory(dbClient, book.categoryName))
            if (!category) throw new Error('Failed to add category');
            categoryId = category.id;
        }
        const newBook = await addScrapedBook(dbClient, book, categoryId);

        dbClient.query('COMMIT');
        return {
            statusCode: 200,
            response: newBook,
        }
    } catch (error: any) {
        dbClient.query('ROLLBACK');
        await sendErrorMailToAdmins(req, error);
        return {
            statusCode: 400,
            error: error.message,
        }
    } finally {
        dbClient.release();
        await closePage(page);
        await closeBrowser(browser);
    }
}

export async function scrapeCategories(req: Request, res: Response): Promise<ApiResponse<Category[]>> {
    let browser: Browser | undefined = undefined;
    let page: Page | undefined = undefined;

    const dbClient = await db.pool.connect();
    try {
        const browser = await initializeBrowser();
        if (!browser) throw new Error('Failed to load browser');

        page = await InitializePage(browser, 'https://books.toscrape.com/');
        if (!page) throw new Error('Failed to load page');

        const scrapedCategories = await scrapeCategoriesHandler(page);

        dbClient.query('BEGIN');
        const categories = await addAllScrapedCategoriesToDatabase(dbClient, scrapedCategories);
        dbClient.query('COMMIT');

        return {
            statusCode: 200,
            response: categories,
        }

    } catch (error: any) {
        dbClient.query('ROLLBACK');
        await sendErrorMailToAdmins(req, error);
        return {
            statusCode: 400,
            error: error.message,
        }

    } finally {
        dbClient.release();
        await closePage(page);
        await closeBrowser(browser);
    }
}

export async function scrapeCategoryBooks(req: Request, res: Response): Promise<ApiResponse<Book[]>> {
    let categoryUrlToScrape = req.body?.urlToScrape as string;
    if (!categoryUrlToScrape) throw new Error('urlToScrape is required');
    let browser: Browser | undefined = undefined;
    const dbClient = await db.pool.connect();
    let i = 1;
    try {
        const categoryId = await getCategoryIdByUrlToScrape(dbClient, categoryUrlToScrape);
        if (!categoryId) throw new Error('This category doesnt exist in database!');
        const browser = await initializeBrowser();
        if (!browser) throw new Error('Failed to load page');
        let books: Book[] = [];

        while (true) {
            const page = await InitializePage(browser, categoryUrlToScrape);
            if (!page) throw new Error('Failed to load page');
            const bookUrlsToScrape = await scrapeCategoryBooksHandler(page);

            await closePage(page);
            if (!bookUrlsToScrape.length) {
                break;
            }

            for (const bookToScrape of bookUrlsToScrape) {
                const bookUrlToScrape = bookToScrape.urlToScrape
                const bookPage = await InitializePage(browser, bookUrlToScrape);
                if (!bookPage) throw new Error('Failed to load page');

                const scrapedBook = await scrapeBookHandler(bookPage, bookUrlToScrape);
                if (!scrapedBook) continue;
                await closePage(bookPage);
                const newBook = await addScrapedBook(dbClient, scrapedBook, categoryId);
                if (!newBook) continue;
                books.push(newBook);
            }

            i++;
            categoryUrlToScrape = categoryUrlToScrape.replace(/(index\.html|page-\d+\.html)/, `page-${i}.html`);
            // await sleep(3000);
        }


        return {
            statusCode: 200,
            response: books,
        }
    } catch (error: any) {
        dbClient.query('ROLLBACK');
        await sendErrorMailToAdmins(req, error);
        return {
            statusCode: 400,
            error: error.message,
        }
    } finally {
        dbClient.release();
        await closeBrowser(browser);
    }

}

export async function scrapeAllDatabase(req: Request, res: Response): Promise<ApiResponse<ScrapeDatabase>> {
    let urlToScrape = 'https://books.toscrape.com/';
    let browser: Browser | undefined = undefined;
    const dbClient = await db.pool.connect();

    try {
        browser = await initializeBrowser();
        if (!browser) throw new Error('Failed to load browser');

        let homePage = await InitializePage(browser, urlToScrape);
        if (!homePage) throw new Error('Failed to home page');

        const categories = await scrapeCategoriesHandler(homePage);
        await closePage(homePage);

        let running = true;
        const database: ScrapeDatabase = {};

        for (const category of categories) {
            database[category.title] = {
                scrapedUrl: category.urlToScrape,
                name: category.title,
                books: [],
            };
            console.log('Scraping category: ', category.title);

            let i = 1;

            let categoryUrlToScape = category.urlToScrape;
            while (true) {
                const categoryPage = await InitializePage(browser, categoryUrlToScape);
                if (!categoryPage) throw new Error('Failed to load page');

                const pageBooks = await scrapeCategoryBooksHandler(categoryPage);
                await closePage(categoryPage);

                if (!pageBooks.length) {
                    break;
                }

                for (const book1 of pageBooks) {
                    const bookUrlToScrape = book1.urlToScrape;
                    const bookPage = await InitializePage(browser, bookUrlToScrape);
                    if (!bookPage) throw new Error('Failed to load page');

                    const book = await scrapeBookHandler(bookPage, bookUrlToScrape);
                    if (!book) continue;
                    await closePage(bookPage);
                    database[category.title].books.push(book);
                }
                i++;
                categoryUrlToScape = categoryUrlToScape.replace(/(index\.html|page-\d+\.html)/, `page-${i}.html`);

                // await sleep(3000);
            }
            running = true;
            console.log(`${category.title} books: ${database[category.title].books.length}`);

        }
        console.log('Adding to database..');
        await dbClient.query('BEGIN');
        await addAllScrapedDataToDatabase(dbClient, database);
        await dbClient.query('COMMIT');

        return {
            statusCode: 200,
            response: database,
        }
    } catch (error: any) {
        await dbClient.query('ROLLBACK');
        await sendErrorMailToAdmins(req, error);
        return {
            statusCode: 400,
            error: error.message,
        }
    } finally {
        dbClient.release();
        await closeBrowser(browser);
    }

}