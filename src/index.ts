import express from 'express';
import routes from './routing/root';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World2!');
});

app.listen(port, () => {
  routes(app);
  console.log(`Server running at http://localhost:${port}`);
});