import express from 'express';
import cors from 'cors';
import { connectDB } from './database/config/db.js';
import { userRouter } from './router/userRouter.js';
import { eventRouter } from './router/eventRouter.js';
import { swaggerSpec } from './swagger.js';
import swaggerUi from 'swagger-ui-express';

//dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(userRouter);
app.use(eventRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(PORT, (err) => {

  if (err) {
    console.error('Failed to start server on ${PORT} port:', err);
    return;
  }
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});
