import { Request, Response } from "express";
import { Browser, Page } from 'puppeteer';
import { closeBrowser, closePage, initializeBrowser, InitializePage } from "../db/helpers/puppeteer.handler";
import { scrapeCategoriesHandler, scrapeCategoryBooksHandler } from "../db/helpers/scrape-handler";
import { sleep } from "../db/helpers/timers";
import { ApiResponse } from "../db/models/ApiResponse";
import { ScrapeUrl } from "../db/models/scrape";
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
        if (!page) throw new Error('Failed to load page');

        const book = await scrapeBookHandler(page);
        return {
            statusCode: 200,
            response: book,
        }
    } catch (error: any) {
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
        return {
            statusCode: 400,
            error: error.message,
        }
    } finally {
        await closeBrowser(browser);
    }

}