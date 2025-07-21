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

    const title = (await page.$('h1'))
        ? await page.$eval('h1', el => el.textContent?.trim()) ?? ''
        : '';

    let rating = null;
    for (let i = 0; i < ratings.length; i++) {
        const number = ratings[i];
        const exists = await page.$(`.product_main .star-rating.${number}`);

        if (exists) {
            rating = i + 1;
            break;
        }
    }

    const inStockEl = await page.$('.instock.availability');
    const inStockText = inStockEl
        ? await page.evaluate(el => el.textContent || '', inStockEl)
        : '';
    const inStock = inStockText.match(/\d+/)?.[0] || '0';

    // Price (safe version)
    const priceEl = await page.$('.price_color');
    const priceText = priceEl
        ? await page.evaluate(el => el.textContent?.trim().replace('£', ''), priceEl)
        : '';

    const description = (await page.$('.product_page > p'))
        ? await page.$eval('.product_page > p', el => el.textContent?.trim()) ?? ''
        : '';

    const book: ScrapeBook = {
        title,
        price: priceText ? Number(priceText) : null,
        inStock: Number(inStock),
        rating,
        description,
    };

    return book;
}