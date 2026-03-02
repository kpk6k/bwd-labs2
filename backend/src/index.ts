import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './database/config/db';
import { authRouter } from './router/authRouter';
import { publicRouter } from './router/publicRouter';
import { router } from './router/indexRouter';
import { swaggerSpec } from './swagger';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import { passport } from './database/config/passport';

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 100,
});

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//app.use(passport.initialize());

app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));
app.use(cors());
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }
    next(err);
});
app.use(limiter);
app.use(authRouter);
app.use(publicRouter);
app.use(router);
// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        message: 'Not Found',
        path: req.originalUrl,
        method: req.method,
    });
});

const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello, World!' });
});

app.listen(PORT, (err: any) => {
    if (err) {
        console.error(`Failed to start server on ${PORT} port:`, err);
        return;
    }
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDB();
});
