import express, { RequestHandler } from "express";
import cors from "cors";
import axios from "axios";
import { createClient } from "redis";

const redisClient = createClient();

const app = express();

app.use(cors());

const start = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected ✅");
  } catch (err) {
    console.error("Failed to start:", err);
  }
};

start();

const getOrSetCache = async <T>(key: string, cb: () => Promise<T>) => {
  const data = await redisClient.get(key);

  if (data != null) return JSON.parse(data);

  const freshData = await cb();
  await redisClient.setEx(key, 3600, JSON.stringify(freshData));
  return freshData;
};

const getPhotos: RequestHandler = async (req, res, next) => {
  const albumId = req.query.albumId;
  const key = `photos:?alumId=${albumId}`;

  const data = await getOrSetCache(key, async () => {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/photos",
      { params: { albumId } }
    );

    return data;
  });

  res.json(data);
};

const getPhoto: RequestHandler = async (req, res, next) => {
  const key = `photos:?id=${req.params.id}`;

  const data = await getOrSetCache(key, async () => {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
    );

    return data;
  });

  res.json(data);
};

app.get("/photos", getPhotos);
app.get("/photos/:id", getPhoto);

export default app;
