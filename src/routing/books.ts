import { Router } from "express"
import { requestHandler } from "../db/helpers/request.handler";
import { createBook, deleteBook, getBook, getBooks, updateBook } from "../controllers/books-controllers";

const booksRouter = Router();

booksRouter
    .route('/')
    .get(async (req, res) => requestHandler(req, res, getBooks))
    .post((req, res) => requestHandler(req, res, createBook));

booksRouter
    .route('/:id')
    .get(async (req, res) => requestHandler(req, res, getBook))
    .put((req, res) => requestHandler(req, res, updateBook))
    .delete((req, res) => requestHandler(req, res, deleteBook));

export default booksRouter;