import { Request, Response } from "express";
import { Browser, Page } from 'puppeteer';
import { sendErrorMailToAdmins } from "../db/helpers/mailer.handler";
import { closeBrowser, closePage, initializeBrowser, InitializePage } from "../db/helpers/puppeteer.handler";
import { scrapeCategoriesHandler, scrapeCategoryBooksHandler } from "../db/helpers/scrape-handler";
import { sleep } from "../db/helpers/timers";
import { ApiResponse } from "../db/models/ApiResponse";
import { ScrapeDatabase, ScrapeUrl } from "../db/models/scrape";
import { scrapeBookHandler } from './../db/helpers/scrape-handler';

export async function scrapeBook(req: Request, res: Response): Promise<ApiResponse<any>> {
    let urlToScrape = req.body?.urlToScrape as string;
    if (!urlToScrape) throw new Error('urlToScrape is required');

    let browser: Browser | undefined = undefined;
    let page: Page | undefined = undefined;
    try {
        browser = await initializeBrowser();
        if (!browser) throw new Error('Failed to load browser');

        page = await InitializePage(browser, urlToScrape);
        console.log(page);

        if (!page) throw new Error('Failed to load page');

        const book = await scrapeBookHandler(page);
        return {
            statusCode: 200,
            response: book,
        }
    } catch (error: any) {
        await sendErrorMailToAdmins(req, error);
        return {
            statusCode: 400,
            error: error.message,
        }
    } finally {
        await closePage(page);
        await closeBrowser(browser);
    }
}

export async function scrapeCategories(req: Request, res: Response): Promise<ApiResponse<ScrapeUrl[]>> {
    let browser: Browser | undefined = undefined;
    let page: Page | undefined = undefined;
    try {
        const browser = await initializeBrowser();
        if (!browser) throw new Error('Failed to load browser');

        page = await InitializePage(browser, 'https://books.toscrape.com/');
        if (!page) throw new Error('Failed to load page');

        const categories = await scrapeCategoriesHandler(page);

        return {
            statusCode: 200,
            response: categories,
        }

    } catch (error: any) {
        await sendErrorMailToAdmins(req, error);
        return {
            statusCode: 400,
            error: error.message,
        }

    } finally {
        await closePage(page);
        await closeBrowser(browser);
    }
}

export async function scrapeCategoryBooks(req: Request, res: Response): Promise<ApiResponse<ScrapeUrl[]>> {
    let urlToScrape = req.body?.urlToScrape as string;
    if (!urlToScrape) throw new Error('urlToScrape is required');

    let browser: Browser | undefined = undefined;
    let i = 1;
    try {
        const browser = await initializeBrowser();
        if (!browser) throw new Error('Failed to load page');
        let books: ScrapeUrl[] = [];
        let running = true;

        while (running) {
            const page = await InitializePage(browser, urlToScrape);
            if (!page) throw new Error('Failed to load page');
            const pageBooks = await scrapeCategoryBooksHandler(page);

            books = [...books, ...pageBooks];

            await closePage(page);
            if (!pageBooks.length) {
                running = false;
            }
            i++;
            urlToScrape = urlToScrape.replace(/(index\.html|page-\d+\.html)/, `page-${i}.html`);
            await sleep(3000);
        }


        return {
            statusCode: 200,
            response: books,
        }
    } catch (error: any) {
        await sendErrorMailToAdmins(req, error);
        return {
            statusCode: 400,
            error: error.message,
        }
    } finally {
        await closeBrowser(browser);
    }

}

export async function scrapeAllDatabase(req: Request, res: Response): Promise<ApiResponse<ScrapeDatabase>> {
    let urlToScrape = 'https://books.toscrape.com/';
    let browser: Browser | undefined = undefined;
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
            database[category.title] = [];
            console.log('Scraping category: ', category.title);

            urlToScrape = category.urlToScrape;
            let i = 1;

            while (running) {
                const categoryPage = await InitializePage(browser, urlToScrape);
                if (!categoryPage) throw new Error('Failed to load page');

                const pageBooks = await scrapeCategoryBooksHandler(categoryPage);
                await closePage(categoryPage);

                if (!pageBooks.length) {
                    running = false;
                }

                for (const book1 of pageBooks) {
                    urlToScrape = book1.urlToScrape;
                    const bookPage = await InitializePage(browser, urlToScrape);
                    if (!bookPage) throw new Error('Failed to load page');

                    const book = await scrapeBookHandler(bookPage);
                    if (!book) continue;
                    await closePage(bookPage);
                    database[category.title].push(book);
                }
                urlToScrape = urlToScrape.replace(/(index\.html|page-\d+\.html)/, `page-${i}.html`);
                await sleep(3000);
            }
            running = true;
            console.log(`${category.title} books: ${database[category.title].length}`);
        }

        return {
            statusCode: 200,
            response: database,
        }
    } catch (error: any) {
        await sendErrorMailToAdmins(req, error);
        return {
            statusCode: 400,
            error: error.message,
        }
    } finally {
        await closeBrowser(browser);
    }

}