import { Router } from "express";
import { requestHandler } from "../db/helpers/request.handler";
import { scrapeBook, scrapeCategories, scrapeCategoryBooks } from "../controllers/scrape-controllers";

const scrapeRouter = Router();

scrapeRouter
    .route('/books/:id')
    .post((req, res) => requestHandler(req, res, scrapeBook))

scrapeRouter
    .route('/categories')
    .post((req, res) => requestHandler(req, res, scrapeCategories))


scrapeRouter
    .route('/category/books')
    .post((req, res) => requestHandler(req, res, scrapeCategoryBooks))

export default scrapeRouter;
