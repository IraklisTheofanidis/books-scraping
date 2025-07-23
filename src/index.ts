import * as dotenv from "dotenv";
dotenv.config();
import express from 'express';
import routes from './routing/root';

const app = express();
app.use(express.json({ limit: "75mb" }));

const port = 3000;

app.listen(port, () => {
  routes(app);
  console.log(`Server running at http://localhost:${port}`);
});