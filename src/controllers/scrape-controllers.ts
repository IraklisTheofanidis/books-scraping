import { ApiResponse } from "../db/models/ApiResponse";
import { Request, Response } from "express";
import puppeteer, { Browser, HTTPResponse, Page } from 'puppeteer';
import { closeBrowser, closePage, initializeBrowser, InitializePage } from "../db/helpers/puppeteer.handler";
import { sleep } from "../db/helpers/timers";
import { url } from "inspector";
import { ScrapeBook, ScrapeUrl } from "../db/models/scrape";

export async function scrapeBook(req: Request, res: Response): Promise<ApiResponse<any>> {
    let urlToScrape = req.body?.urlToScrape as string;
    if (!urlToScrape) throw new Error('urlToScrape is required');

    let browser: Browser | undefined = undefined;
    let page: Page | undefined = undefined;
    try {
        browser = await initializeBrowser(urlToScrape);
        if (!browser) throw new Error('Failed to load browser');
        page = await InitializePage(browser, urlToScrape);
        if (!page) throw new Error('Failed to load page');

        const ratings = ['One', 'Two', 'Three', 'Four', 'Five'];
        let rating: number | null = null;

        for (let i = 0; i < ratings.length; i++) {
            const number = ratings[i];
            const exists = await page.$(`.star-rating.${number}`);

            if (exists) {
                rating = i + 1;
                break;
            }
        }

        const inStockText = await page.$eval('.instock.availability', el => el.textContent || '');
        const inStock = inStockText.match(/\d+/)?.[0] || '0';

        const priceText = await page.$eval('.price_color', el =>
            el.textContent?.trim().replace('£', '') || '');

        const description = await page.$eval('.product_page > p', el => el.textContent?.trim()) ?? '';
        const title = await page.$eval('h1', el => el.textContent?.trim()) ?? '';

        const book: ScrapeBook = {
            title,
            price: priceText ? Number(priceText) : null,
            inStock: Number(inStock),
            rating,
            description,
        }
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
        const browser = await initializeBrowser('https://books.toscrape.com/');
        if (!browser) throw new Error('Failed to load browser');
        page = await InitializePage(browser, 'https://books.toscrape.com/');
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
        const browser = await initializeBrowser(urlToScrape);
        if (!browser) throw new Error('Failed to load page');
        // These two lines above are the same.
        let books: ScrapeUrl[] = [];
        let running = true;

        while (running) {
            const page = await InitializePage(browser, urlToScrape);
            if (!page) throw new Error('Failed to load page');
            const pageBooks = await page.$$eval('ol > li > article > h3 > a', links =>
                links.filter(link => {
                    return link.textContent && link.getAttribute('href');
                }).map(link => {
                    return {
                        title: link.textContent!.trim(),
                        urlToScrape: new URL(link.getAttribute('href')!, window.location.href).href,
                    }
                })
            ) ?? [];

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