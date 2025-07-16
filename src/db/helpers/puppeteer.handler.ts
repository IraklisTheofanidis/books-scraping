import puppeteer, { Browser, Page } from 'puppeteer';

export const initializeBrowser = async (url: string): Promise<Page | undefined> => {

    const browser = await puppeteer.launch({
        executablePath: 'C:\\Users\\Hercules\\.cache\\puppeteer\\chrome\\win64-138.0.7204.157\\chrome-win64\\chrome.exe',
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1024 });
    const res = await page.goto('https://books.toscrape.com/', { waitUntil: 'domcontentloaded' });

    if (!res) return;
    return page;


}

export const closeBrowser = async (browser?: Browser): Promise<any> => {
    if (!browser) return;
    await browser.close();
    console.log('Browser closed successfully');
}