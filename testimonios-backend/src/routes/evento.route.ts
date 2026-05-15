import type { RequestHandler } from "express";
import { getAllEvents, getEventById, getAllEventsAdmin, createEvent, updateEvent, deleteEvent } from "@app/controllers/evento.controller";
import { authenticateToken } from "@app/middleware/authentication";
import { authorizeRoles, Rol } from "@app/middleware/authorization";
import express from "express";

export const eventoRouter = express.Router();

eventoRouter.get("/", getAllEvents as RequestHandler);
eventoRouter.get("/admin", authenticateToken, authorizeRoles(Rol.ADMIN), getAllEventsAdmin as RequestHandler);
eventoRouter.get("/:id", authenticateToken, authorizeRoles(Rol.ADMIN), getEventById as RequestHandler);
eventoRouter.post("/", authenticateToken, authorizeRoles(Rol.ADMIN), createEvent as RequestHandler);
eventoRouter.put("/:id", authenticateToken, authorizeRoles(Rol.ADMIN), updateEvent as RequestHandler);
eventoRouter.delete("/:id", authenticateToken, authorizeRoles(Rol.ADMIN), deleteEvent as RequestHandler);
