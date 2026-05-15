import { EventoModel } from "@app/models/EventoModel";

export const eventoService = {
  getAllEvents: async () => {
    const events = await EventoModel.findAll();
    return events.map((e) => ({
      id: e.id_evento,
      name: e.nombre,
      description: e.descripcion,
      date: e.fecha,
    }));
  },
  getEventById: async (id: number) => EventoModel.findById(id),
  createEvent: async (data: { nombre: string; descripcion: string; fecha: string }) =>
    EventoModel.create(data),
  updateEvent: async (id: number, data: { nombre?: string; descripcion?: string; fecha?: string }) =>
    EventoModel.update(id, data),
  deleteEvent: async (id: number) => EventoModel.delete(id),
};
