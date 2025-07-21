import { ScrapeDatabase } from './../db/models/scrape';
import { Router } from "express";
import { requestHandler } from "../db/helpers/request.handler";
import { scrapeAllDatabase, scrapeBook, scrapeCategories, scrapeCategoryBooks } from "../controllers/scrape-controllers";

const scrapeRouter = Router();

scrapeRouter
    .route('/book')
    .post((req, res) => requestHandler(req, res, scrapeBook))

scrapeRouter
    .route('/categories')
    .post((req, res) => requestHandler(req, res, scrapeCategories))


scrapeRouter
    .route('/category/books')
    .post((req, res) => requestHandler(req, res, scrapeCategoryBooks))

scrapeRouter
    .route('/database')
    .post((req, res) => requestHandler(req, res, scrapeAllDatabase))
    
export default scrapeRouter;
