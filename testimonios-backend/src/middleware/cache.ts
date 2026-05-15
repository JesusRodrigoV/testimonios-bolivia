import apicache from "apicache";
import type { NextFunction, Request, Response } from "express";

const cache = apicache.middleware;
const onlyStatus200 = (req: Request, res: Response) => res.statusCode === 200;
const defaultDuration = "5 minutes";

export const publicCache = (duration: string = "30 minutes") =>
  cache(duration, onlyStatus200);

export const authCache = (duration: string = defaultDuration) =>
  cache(duration, onlyStatus200);

export const clearCache =
  (keys: string[]) => (req: Request, res: Response, next: NextFunction) => {
    keys.forEach((key) => apicache.clear(key));
    next();
  };
