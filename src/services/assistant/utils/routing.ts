import type { Request, Response } from 'express';

export const sendError = (req: Request, res: Response, error: any) => {
  console.log(`Error while processing ${req.method} request at '${req.path}'`);
  console.log(error);
  res.status(400).send({
    error: 'message' in error ? error.message : JSON.stringify(error),
  });
};

export const sendData = (req: Request, res: Response, data: any) => {
  console.log(`Successfully processed ${req.method} request at '${req.path}'`);
  res.send({ data });
};
