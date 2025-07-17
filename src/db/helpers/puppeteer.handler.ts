import puppeteer, { Browser, Page } from 'puppeteer';

export const initializeBrowser = async (url: string): Promise<Browser | undefined> => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Users\\Hercules\\.cache\\puppeteer\\chrome\\win64-138.0.7204.157\\chrome-win64\\chrome.exe',
    });
    return browser;
}

export const InitializePage = async (browser: Browser, url: string): Promise<Page | undefined> => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1024 });
    const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
    if (!res) return;
    return page;
}

export const closeBrowser = async (browser?: Browser): Promise<any> => {
    if (!browser) return;
    await browser.close();
    console.log('Browser closed successfully');
}