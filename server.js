import express from "express";
import cors from "cors";

// Create express application
const port = 8080;
const app = express();

// Enable cross-origin resources sharing (CORS)
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "https://www.google.com",
      "https://www.reddit.com",
    ],
  })
);

app.use(express.json());

import docsRouter from "./middleware/swagger-doc.js";
app.use(docsRouter);

import userController from "./controllers/users.js";
app.use(userController);
import readingController from "./controllers/readings.js";
app.use(readingController);

app.listen(port, () => {
  console.log("Express started on http://localhost:" + port);
});
