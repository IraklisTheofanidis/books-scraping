import { Express } from "express";
import booksRouter from "./books";
import scrapeRouter from "./scrape";


function routes(app: Express) {
    app.use("/scrape", scrapeRouter);
    app.use("/books", booksRouter);
}

export default routes;