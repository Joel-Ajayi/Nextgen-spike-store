import express, { Application, NextFunction, Request, Response } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send({ hey: "hi" });
});

app.listen(5000, () => console.log("done"));
