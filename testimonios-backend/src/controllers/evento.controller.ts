import type { Request, Response } from "express";
import { parse, ValiError } from "valibot";
import { EventoModel, createEventoSchema, updateEventoSchema } from "@app/models/EventoModel";

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const eventos = await EventoModel.findAll();
    res.json(
      eventos.map((e) => ({
        id: e.id_evento,
        name: e.nombre,
        description: e.descripcion,
        date: e.fecha,
      })),
    );
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener los eventos" });
  }
};

export const getAllEventsAdmin = async (req: Request, res: Response) => {
  try {
    const eventos = await EventoModel.findAllAdmin();
    res.json(eventos);
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener los eventos" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "ID no proporcionado" });
    }
    const id = parseInt(req.params.id);
    const evento = await EventoModel.findById(id);
    if (!evento || !evento.is_active) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }
    res.json(evento);
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener el evento" });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, fecha } = parse(createEventoSchema, req.body);
    const evento = await EventoModel.create({ nombre, descripcion, fecha });
    res.status(201).json(evento);
  } catch (error) {
    if (error instanceof ValiError) {
      return res.status(400).json({ error: error.issues.map((i) => i.message).join("; ") });
    }
    return res.status(500).json({ error: "Error al crear el evento" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "ID no proporcionado" });
    }
    const id = parseInt(req.params.id);
    const existing = await EventoModel.findById(id);
    if (!existing || !existing.is_active) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }
    const data = parse(updateEventoSchema, req.body);
    const evento = await EventoModel.update(id, data);
    res.json(evento);
  } catch (error) {
    if (error instanceof ValiError) {
      return res.status(400).json({ error: error.issues.map((i) => i.message).join("; ") });
    }
    return res.status(500).json({ error: "Error al actualizar el evento" });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "ID no proporcionado" });
    }
    const id = parseInt(req.params.id);
    await EventoModel.delete(id);
    res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Error al eliminar el evento" });
  }
};
