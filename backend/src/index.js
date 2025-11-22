import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './database/config/db.js';
import authRouter from "./router/authRouter.js";
import publicRouter from './router/publicRouter.js';
import router from './router/indexRouter.js';
import { swaggerSpec } from './swagger.js';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import passport from './database/config/passport.js';

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 100,
});

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(passport.initialize());

app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));
app.use(cors());

app.use(limiter);
app.use(authRouter); 
app.use(publicRouter);
app.use(router);

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
