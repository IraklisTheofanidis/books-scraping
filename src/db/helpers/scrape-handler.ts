import { Page } from "puppeteer";
import { ScrapeBook, ScrapeUrl } from "../models/scrape";

export const scrapeCategoriesHandler = async (page: Page): Promise<ScrapeUrl[]> => {
    return await page.$$eval('.nav.nav-list > li > ul > li > a', links =>
        links.filter(link => link.textContent && link.getAttribute('href')).map(link => ({
            title: link.textContent!.trim(),
            urlToScrape: new URL(link.getAttribute('href')!, window.location.origin).href,
        }))
    );
}

export const scrapeCategoryBooksHandler = async (page: Page): Promise<ScrapeUrl[]> => {
    return await page.$$eval('ol > li > article > h3 > a', links =>
        links.filter(link => {
            return link.textContent && link.getAttribute('href');
        }).map(link => {
            return {
                title: link.textContent!.trim(),
                urlToScrape: new URL(link.getAttribute('href')!, window.location.href).href,
            }
        })
    ) ?? [];
}

export const scrapeBookHandler = async (page: Page): Promise<ScrapeBook> => {
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
    };

    return book;
}