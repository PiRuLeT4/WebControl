import { db } from "../database.js";

// Funciona con varios ids de obras. Necesario para obtener las horas
//  de las obras subordinadas
export class HoraModel {
  static async getByObra({ idsObra }) {
    const placeholders = idsObra.map(() => "?").join(", ");
    const query = `
    SELECT
        h.dia_trabajado,
        u.codigo_firma AS usuario,
        h.id_tarea,
        h.fecha_validacion,
        u2.codigo_firma AS usuario_validacion,
        h.num_horas,
        h.precio_hora
    FROM
        horasobra AS h
    LEFT JOIN
        usuarios AS u ON h.codigo_usuario = u.codigo_usuario
    LEFT JOIN
        usuarios AS u2 ON h.codigo_usuario_validacion = u2.codigo_usuario
    WHERE
        h.id_obra IN (${placeholders})
    `;

    const [result] = await db.query(query, idsObra);
    return result;
  }

  // Obtener TODAS las horas (validadas y sin validar) para aplicar filtros
  static async getAllHoras() {
    const query = `
  SELECT
    u.codigo_usuario,
    u.nombre,
    u.apellido1,
    u.apellido2,
    u.usuario_bonita AS nombre_usuario,
    o.codigo_obra,
    o.descripcion_obra,
    o.observaciones,
    o.estado_obra,
    o.tipo_obra,
    eo.descripcion_estado AS estado_obra_descripcion,
    tip.descripcion AS tipo_obra_descripcion,
    h.dia_trabajado,
    h.fecha_validacion,
    h.fecha_planificacion,
    h.codigo_usuario_validacion,
    u_validador.nombre AS nombre_validador,
    u_validador.apellido1 AS apellido1_validador,
    u_validador.apellido2 AS apellido2_validador,
    u_validador.usuario_bonita AS nombre_usuario_validador,
    t.etiqueta AS tarea,
    t.descripcion AS descripcion_tarea,
    h.num_horas
  FROM
    horasobra h
  JOIN
    usuarios u ON h.codigo_usuario = u.codigo_usuario
  LEFT JOIN
    usuarios u_validador ON h.codigo_usuario_validacion = u_validador.codigo_usuario
  JOIN
    obras o ON h.id_obra = o.id_obra
  LEFT JOIN
    tipoestadosobras eo ON o.estado_obra = eo.codigo_estado
  LEFT JOIN
    tipoobra tip ON o.tipo_obra = tip.id_tipo
  LEFT JOIN 
    tareas t ON h.id_tarea = t.id
  WHERE
    h.fecha_baja IS NULL
  ORDER BY
    h.dia_trabajado DESC, u.codigo_usuario, o.codigo_obra;
  `;
    const [result] = await db.query(query);
    return result;
  }

  // Obtener horas solo de los subordinados de un manager específico
  static async getHorasBySubordinados(managerCodigo) {
    console.log("🔍 getHorasBySubordinados - managerCodigo:", managerCodigo);
    const query = `
  SELECT
    u.codigo_usuario,
    u.nombre,
    u.apellido1,
    u.apellido2,
    u.usuario_bonita AS nombre_usuario,
    o.codigo_obra,
    o.descripcion_obra,
    o.observaciones,
    o.estado_obra,
    o.tipo_obra,
    eo.descripcion_estado AS estado_obra_descripcion,
    tip.descripcion AS tipo_obra_descripcion,
    h.dia_trabajado,
    h.fecha_validacion,
    h.fecha_planificacion,
    h.codigo_usuario_validacion,
    u_validador.nombre AS nombre_validador,
    u_validador.apellido1 AS apellido1_validador,
    u_validador.apellido2 AS apellido2_validador,
    u_validador.usuario_bonita AS nombre_usuario_validador,
    t.etiqueta AS tarea,
    t.descripcion AS descripcion_tarea,
    h.num_horas
  FROM
    horasobra h
  JOIN
    usuarios u ON h.codigo_usuario = u.codigo_usuario
  JOIN
    responsables r ON u.codigo_usuario = r.cod_usuario
  LEFT JOIN
    usuarios u_validador ON h.codigo_usuario_validacion = u_validador.codigo_usuario
  JOIN
    obras o ON h.id_obra = o.id_obra
  LEFT JOIN
    tipoestadosobras eo ON o.estado_obra = eo.codigo_estado
  LEFT JOIN
    tipoobra tip ON o.tipo_obra = tip.id_tipo
  LEFT JOIN 
    tareas t ON h.id_tarea = t.id
  WHERE
    h.fecha_baja IS NULL
    AND r.cod_usuario_manager = ?
  ORDER BY
    h.dia_trabajado DESC, u.codigo_usuario, o.codigo_obra;
  `;
    const [result] = await db.query(query, [managerCodigo]);
    console.log(
      "📊 getHorasBySubordinados - resultados encontrados:",
      result.length
    );
    return result;
  }

  // funcion para agregar una nueva hora a la base de datos
  static async create({ input }) {
    const validatedData = validateObra(input);

    if (!validatedData.success) {
      // Error personalizado para que lo capture nuesto middleware de gestión de errores
      const error = new Error("Validation Failed");
      error.name = "ValidationError";
      // Lanzamos el error para que lo atrape el controlador
      throw error;
    }

    // Extraemos la info
    const validData = validatedData.data;
    // Extraemos propiedades de la información validada
    const values = Object.values(validData);

    // Query
    const query = `
      INSERT INTO obras (
          codigo_obra,
          descripcion_obra,
          fecha_seg,
          tipo_obra,
          facturable,
          estado_obra,
          fecha_alta,
          codigo_usuario_alta,
          fecha_prevista_fin,
          fecha_oferta,
          horas_previstas,
          gasto_previsto,
          importe,
          viabilidad,
          id_empresa,
          id_contacto,
          id_edificio,
          observaciones,
          observaciones_internas,
          version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;

    const [result] = await db.query(query, [...values]);

    // Seleccionamos el registro recién insertado y que vamos a devolver
    // como resultado de la operación de creación
    const [rows] = await db.query(
      `
         SELECT
          codigo_obra,
          descripcion_obra,
          fecha_seg,
          tipo_obra,
          facturable,
          estado_obra,
          fecha_alta,
          codigo_usuario_alta,
          fecha_prevista_fin,
          fecha_oferta,
          horas_previstas,
          gasto_previsto,
          importe,
          viabilidad,
          id_empresa,
          id_contacto,
          id_edificio,
          observaciones,
          observaciones_internas
        FROM obras
        WHERE id_obra = ?`,
      [result.insertId]
    );
    return rows[0] ?? null;
  }
}
