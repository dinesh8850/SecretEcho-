import express from 'express';
import morgan from 'morgan';
import connectDB from './db/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';



// Routers
import userRouter from './routes/user.routes.js';
import projectRouter from './routes/project.routes.js';
import chatRouter from './routes/chat.routes.js'; // ✅ Import chat router

// Initialize DB
connectDB();

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Routes
app.use('/users', userRouter);
app.use('/projects', projectRouter);
app.use('/chat', chatRouter); // ✅ Add Groq chat route

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

export default app;
