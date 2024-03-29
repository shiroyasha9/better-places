import dotenv from 'dotenv';
import express, { ErrorRequestHandler, Express } from 'express';
import mongoose from 'mongoose';

import HttpError from './models/httpError.js';
import placesRoutes from './routes/placesRoutes.js';
import usersRoutes from './routes/usersRoutes.js';

import fs from 'fs';
import path from 'path';

declare global {
  namespace Express {
    interface Request {
      userData: { userId: string };
    }
  }
}

dotenv.config();

const app: Express = express();

const port = process.env.PORT;

if (!fs.existsSync(path.join('uploads', 'images'))) {
  fs.mkdirSync(path.join('uploads'));
  fs.mkdirSync(path.join('uploads', 'images'));
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use(() => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
};

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    app.listen(port, () => {
      console.log(`⚡️[server]: running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
