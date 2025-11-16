import express from 'express';
import cors from 'cors';
//const dotenv = require('dotenv');
//const sequelize = require('./database/config/db.js');

import { connectDB } from './database/config/db.js';

//dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(PORT, (err) => {
  connectDB();
  if (err) {
    console.error('Failed to start server on ${PORT} port:', err);
    return;
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
