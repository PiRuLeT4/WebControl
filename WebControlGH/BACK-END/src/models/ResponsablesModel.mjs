import { db } from "../database.js";

export class ResponsablesModel {
  static async getSubordinadosByManager(managerCodigo) {
    const sql = `
    SELECT u.*
    FROM usuarios u
    JOIN responsables r ON u.codigo_usuario = r.cod_usuario
    WHERE r.cod_usuario_manager = ?
    ORDER BY u.nombre, u.apellido1
  `;
    const [rows] = await db.query(sql, [managerCodigo]);
    return rows;
  }
}
