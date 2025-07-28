import * as dotenv from "dotenv";
dotenv.config();
import express from 'express';
import routes from './routing/root';
import db from "./db/database";

const app = express();
app.use(express.json({ limit: "75mb" }));

const port = 3000;

const connectToDB = async () => await db.connectToDB();

connectToDB();

app.listen(port, () => {
  routes(app);
  console.log(`Server running at http://localhost:${port}`);
});
