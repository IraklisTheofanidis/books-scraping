import { Router } from "express";
import { requestHandler } from "../db/helpers/request.handler";
import { scrapeBook, scrapeBookCategories, scrapeBookCategory, scrapeBooks } from "../controllers/scrape-controllers";

const scrapeRouter = Router();

scrapeRouter
    .route('/books')
    .post((req, res) => requestHandler(req, res, scrapeBooks))

scrapeRouter
    .route('/books/:id')
    .post((req, res) => requestHandler(req, res, scrapeBook))

scrapeRouter
    .route('/categories')
    .post((req, res) => requestHandler(req, res, scrapeBookCategories))

scrapeRouter
    .route('/categories/:id')
    .post((req, res) => requestHandler(req, res, scrapeBookCategory))

export default scrapeRouter;