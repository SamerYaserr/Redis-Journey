import express, { RequestHandler } from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());

const getPhotos: RequestHandler = async (req, res, next) => {
  const albumId = req.query.albumId;
  const { data } = await axios.get(
    "https://jsonplaceholder.typicode.com/photos",
    { params: { albumId } }
  );

  res.json(data);
};

const getPhoto: RequestHandler = async (req, res, next) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );

  res.json(data);
};

app.get("/photos", getPhotos);
app.get("/photos/:id", getPhoto);

export default app;
