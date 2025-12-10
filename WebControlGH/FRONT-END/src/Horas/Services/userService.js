// Servicio para gestionar operaciones relacionadas con usuarios
import axios from "axios";

const BASE_URL = "http://localhost:3002/api";

/**
 * Obtiene los subordinados de un usuario (manager)
 * @param {string|number} codigoResponsable - Código del usuario responsable/manager
 * @returns {Promise<Array>} Lista de subordinados
 */
export const getSubordinados = async (codigoResponsable) => {
  try {
    const endpoint = `${BASE_URL}/responsables/subordinados/${codigoResponsable}`;
    const res = await axios.get(endpoint);
    return res.data?.data || [];
  } catch (err) {
    console.error("Error al recuperar los subordinados -", err);
    return [];
  }
};

/**
 * Obtiene los subordinados del usuario actual desde localStorage
 * @returns {Promise<Array>} Lista de subordinados del usuario logueado
 */
export const getSubordinadosUsuarioActual = async () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      console.warn("No hay usuario en localStorage");
      return [];
    }

    const userData = JSON.parse(storedUser);
    const codigoResponsable = userData.codigo_usuario;

    return await getSubordinados(codigoResponsable);
  } catch (err) {
    console.error("Error al obtener subordinados del usuario actual -", err);
    return [];
  }
};

/**
 * Obtiene todos los usuarios del sistema
 * @returns {Promise<Array>} Lista de todos los usuarios
 */
export const getAllUsuarios = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/usuario`);
    return res.data?.data || [];
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return [];
  }
};
