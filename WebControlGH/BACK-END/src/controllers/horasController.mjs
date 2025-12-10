import { HoraModel } from "../models/horasModel.mjs";

export class HoraController {
  static async getByObra(req, res, next) {
    try {
      const { idsObra } = req.body;
      if (!Array.isArray(idsObra) || idsObra.length === 0) {
        return res.json({ success: true, data: [] });
      }
      const horas = await HoraModel.getByObra({ idsObra });
      res.json({ success: true, data: horas });
    } catch (error) {
      next(error);
    }
  }

  // funcion para detectar las horas pendientes de imputar
  static async getAllHoras(req, res, next) {
    try {
      const horas = await HoraModel.getAllHoras();
      res.json({ success: true, data: horas });
    } catch (error) {
      next(error);
    }
  }

  // funcion para obtener horas de subordinados de un manager
  static async getHorasBySubordinados(req, res, next) {
    try {
      const { managerCodigo } = req.params;
      if (!managerCodigo) {
        return res.status(400).json({
          success: false,
          message: "Se requiere el código del manager",
        });
      }
      const horas = await HoraModel.getHorasBySubordinados(managerCodigo);
      res.json({ success: true, data: horas });
    } catch (error) {
      next(error);
    }
  }

  // funcion para agregar una nueva hora
  static async create(req, res, next) {
    try {
      const input = req.body;
      const nuevaHora = await HoraModel.create({ input });
      res.status(201).json({ success: true, data: nuevahora });
    } catch (error) {
      next(error);
    }
  }
}
