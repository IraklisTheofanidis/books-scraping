import { ApiResponse } from "../db/models/ApiResponse";
import { Request, Response } from "express";
import puppeteer, { Browser, HTTPResponse } from 'puppeteer';
import { closeBrowser, initializeBrowser, InitializePage } from "../db/helpers/puppeteer.handler";
import { sleep } from "../db/helpers/timers";

export async function scrapeBooks(req: Request, res: Response): Promise<ApiResponse<string[]>> {
    return {
        statusCode: 200,
        response: ['book1', 'book2', 'book3']
    }
}

export async function scrapeBook(req: Request, res: Response): Promise<ApiResponse<string>> {
    return {
        statusCode: 200,
        response: 'Scraped book1',
    }
}

export async function scrapeCategories(req: Request, res: Response): Promise<ApiResponse<{ title: string, urlToScrape: string }[]>> {
    let browser: Browser | undefined = undefined;
    try {
        const browser = await initializeBrowser('https://books.toscrape.com/');
        if (!browser) throw new Error('Failed to load browser');
        const page = await InitializePage(browser, 'https://books.toscrape.com/');
        if (!page) throw new Error('Failed to load page');
        const categories = await page.$$eval('.nav.nav-list > li > ul > li > a', links =>
            links.filter(link => link.textContent && link.getAttribute('href')).map(link => ({
                title: link.textContent!.trim(),
                urlToScrape: new URL(link.getAttribute('href')!, window.location.origin).href,
            }))
        );

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
        closeBrowser(browser);
    }
}

export async function scrapeCategoryBooks(req: Request, res: Response): Promise<ApiResponse<{ title: string, urlToScrape: string }[]>> {
    let urlToScrape = req.body?.urlToScrape as string;
    if (!urlToScrape) throw new Error('urlToScrape is required');

    let browser: Browser | undefined = undefined;
    let i = 1;
    try {
        const browser = await initializeBrowser(urlToScrape);
        if (!browser) throw new Error('Failed to load page');
        // These two lines above are the same.
        let books: { title: string, urlToScrape: string }[] = [];
        let running = true;

        while (running) {
            const page = await InitializePage(browser, urlToScrape);
            if (!page) throw new Error('Failed to load page');
            const pageBooks = await page.$$eval('ol > li > article > h3 > a', links =>
                links.filter(link => link.textContent && link.getAttribute('href')).map(link => ({
                    title: link.textContent!.trim(),
                    urlToScrape: new URL(link.getAttribute('href')!, window.location.origin).href,
                }))
            ) ?? [];

            books = [...books, ...pageBooks];

            if (!pageBooks.length) {
                running = false;
            }
            i++;
            urlToScrape = urlToScrape.replace(/(index\.html|page-\d+\.html)/, `page-${i}.html`);
            await sleep(3000);
        }


        return {
            statusCode: 200,
            response: books
        }
    } catch (error: any) {
        return {
            statusCode: 400,
            error: error.message,
        }
    } finally {
        closeBrowser(browser);
    }

}