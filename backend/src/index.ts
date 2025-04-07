import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from MERN Backend!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});