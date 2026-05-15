import type { RequestHandler } from "express";
import { getAllTags } from "@app/controllers/etiqueta.controller";
import express from "express";

export const etiquetaRouter = express.Router();

etiquetaRouter.get("/", getAllTags as RequestHandler);