import { ApiResponse } from "../db/models/ApiResponse";
import { Request, Response } from "express";
import puppeteer, { Browser, HTTPResponse } from 'puppeteer';
import { closeBrowser, initializeBrowser } from "../db/helpers/puppeteer.handler";

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

export async function scrapeBookCategory(req: Request, res: Response): Promise<ApiResponse<string>> {
    return {
        statusCode: 200,
        response: 'Scraped category 1',
    }
}

export async function scrapeBookCategories(req: Request, res: Response): Promise<ApiResponse<{ title: string, urlToScrape: string }[]>> {
    let browser: Browser | undefined = undefined;
    try {
        const page = await initializeBrowser('https://books.toscrape.com/');
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