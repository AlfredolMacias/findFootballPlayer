import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { playersRoute } from './routes/players';
import { gameRouter } from './routes/game';
import { errorHandler } from './middleware/error.middleware';
export const app = express()

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

app.use(express.json())
app.use(helmet());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, try again later"
})

app.use(limiter);

app.use("/api/players", playersRoute)
app.use("/api/game", gameRouter)

const PORT = 3000;

if(process.env.NODE_ENV != "test"){
    app.listen(PORT, () => {
        console.log("Server runnning on http://localhost:"+ PORT);
    })
}
    app.use(errorHandler)