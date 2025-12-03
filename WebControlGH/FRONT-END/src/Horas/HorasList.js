//#region IMPORT
import React, { useState, useEffect, useMemo } from "react";
import {
  Alert,
  Table,
  Button,
  Form,
  Pagination,
  Container,
  Row,
  Col,
  Card,
  Collapse,
  Dropdown,
} from "react-bootstrap";
import axios from "axios";
import "../css/Horas.css";
import { useNavigate } from "react-router-dom";
import { getSubordinadosUsuarioActual } from "./Services/userService";

const HorasList = () => {
  //#region ESTADOS
  // ------------------- ESTADOS ------------------- //
  const [diasPendientes, setDiasPendientes] = useState(0);
  const [horas, setHoras] = useState([]);
  const [estadosObra, setEstadosObra] = useState([]);
  const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);
  const [tiposObra, setTiposObra] = useState([]);
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [mostrarListado, setMostrarListado] = useState(false);
  const [mostrarSoloPendientes, setMostrarSoloPendientes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterUsuario, setFilterUsuario] = useState("");
  const [filterObraText, setFilterObraText] = useState("");
  const [filterPlanificadas, setFilterPlanificadas] = useState(true);
  const [filterPendientes, setFilterPendientes] = useState(true);
  const [filterValidadas, setFilterValidadas] = useState(true);
  const [open, setOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [subordinados, setSubordinados] = useState([]);

  const itemsPerPage = 10;
  const maxPaginasVisibles = 10;
  const navigate = useNavigate();

  // ------------------- DATOS DERIVADOS ------------------- //

  // Usuarios únicos
  const usuariosUnicos = useMemo(() => {
    return subordinados; // ← ya está filtrado por manager
  }, [subordinados]);

  // Obras únicas
  const obrasUnicas = useMemo(() => {
    const map = new Map();
    horas.forEach((h) => {
      const key = String(h.codigo_obra ?? "").trim();
      if (key && !map.has(key)) {
        map.set(key, {
          codigo_obra: key,
          descripcion: h.descripcion_obra ?? "",
        });
      }
    });
    return Array.from(map.values());
  }, [horas]);

  // ------------------- FETCH DATA ------------------- //
  //#region FETCH

  const fetchAllHoras = async () => {
    setLoading(true);
    try {
      const endpoint = "http://localhost:3002/api/horas/all";
      const res = await axios.get(endpoint);
      const data = res.data?.data || [];
      setHoras(data);

      const pendientes = data.filter((h) => !h.fecha_validacion);
      setDiasPendientes(pendientes.length);
    } catch (err) {
      console.error("Error al recuperar las horas -", err);
      setHoras([]);
      setDiasPendientes(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadoObra = async () => {
    try {
      const endpoint = "http://localhost:3002/api/estado-obra";
      const res = await axios.get(endpoint);
      const data = res.data?.data || [];
      const dataOrdenada = data.sort((a, b) => a.orden - b.orden);
      setEstadosObra(dataOrdenada);

      const todosLosEstados = dataOrdenada.map((e) => e.descripcion_estado);
      setEstadosSeleccionados(todosLosEstados);
    } catch (err) {
      console.error("Error al recuperar los estados de las obras -", err);
      setEstadosObra([]);
    }
  };

  const fetchTipoObra = async () => {
    try {
      const endpoint = "http://localhost:3002/api/tipo-obra";
      const res = await axios.get(endpoint);
      const data = res.data?.data || [];
      const dataOrdenada = data.sort((a, b) => a.orden - b.orden);
      setTiposObra(dataOrdenada);

      const todosLosTipos = dataOrdenada.map((e) => e.descripcion);
      setTiposSeleccionados(todosLosTipos);
    } catch (err) {
      console.error("Error al recuperar los tipos de obra -", err);
      setTiposObra([]);
    }
  };

  const fetchSubordinados = async () => {
    const data = await getSubordinadosUsuarioActual();
    setSubordinados(data);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error al parsear el usuario: ", error);
      }
    }
    fetchAllHoras();
    fetchEstadoObra();
    fetchTipoObra();
    fetchSubordinados();
  }, []);
  // ------------------- UTILIDADES ------------------- //
  //#region UTILIDADES
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    try {
      const d = new Date(fecha);
      return d.toLocaleDateString("es-ES");
    } catch {
      return String(fecha);
    }
  };

  // ------------------- FILTRADO ------------------- //
  //#region FILTRADO

  // REEMPLAZA TODA LA SECCIÓN DE FILTRADO por esto:

  const horasFiltradas = useMemo(() => {
    return horas.filter((h) => {
      // 0. Filtro de solo pendientes (cuando se pulsa el alert)
      if (mostrarSoloPendientes && h.fecha_validacion !== null) {
        return false;
      }

      // 1. Búsqueda por texto (solo si hay algo escrito)
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const nombre = [h.nombre, h.apellido1, h.apellido2]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const fecha = h.dia_trabajado
          ? formatearFecha(h.dia_trabajado).toLowerCase()
          : "";
        const cumpleBusqueda =
          nombre.includes(term) ||
          fecha.includes(term) ||
          String(h.num_horas ?? "").includes(term);

        if (!cumpleBusqueda) return false;
      }

      // 2. Fecha inicio (solo si está definida)
      if (filterStart) {
        const fechaHora = new Date(h.dia_trabajado);
        const fechaInicio = new Date(filterStart);
        fechaInicio.setHours(0, 0, 0, 0); // Normalizar a medianoche
        if (fechaHora < fechaInicio) return false;
      }

      // 3. Fecha fin (solo si está definida)
      if (filterEnd) {
        const fechaHora = new Date(h.dia_trabajado);
        const fechaFin = new Date(filterEnd);
        fechaFin.setHours(23, 59, 59, 999); // Fin del día
        if (fechaHora > fechaFin) return false;
      }

      // 4. Usuario (solo si hay uno seleccionado)
      if (filterUsuario) {
        if (h.codigo_usuario !== filterUsuario) {
          return false;
        }
      }

      // 5. Obra (solo si hay texto)
      if (filterObraText.trim()) {
        const obraTexto = filterObraText.toLowerCase();
        const codigoObra = (h.codigo_obra || "").toLowerCase();
        const descripcion = (h.descripcion_obra || "").toLowerCase();
        if (
          !codigoObra.includes(obraTexto) &&
          !descripcion.includes(obraTexto)
        ) {
          return false;
        }
      }

      // 6. Estado obra (CORREGIDO: solo filtrar si NO están todos seleccionados)
      if (
        estadosSeleccionados.length > 0 &&
        estadosSeleccionados.length < estadosObra.length
      ) {
        if (!estadosSeleccionados.includes(h.estado_obra_descripcion)) {
          return false;
        }
      }

      // 7. Tipo obra (CORREGIDO: solo filtrar si NO están todos seleccionados)
      if (
        tiposSeleccionados.length > 0 &&
        tiposSeleccionados.length < tiposObra.length
      ) {
        if (!tiposSeleccionados.includes(h.tipo_obra_descripcion)) {
          return false;
        }
      }

      // 8. Estado de horas (CORREGIDO: si todos están marcados, mostrar todo)
      const todosEstadosMarcados =
        filterPlanificadas && filterPendientes && filterValidadas;

      if (!todosEstadosMarcados) {
        const esPlanificada = h.fecha_planificacion && !h.fecha_validacion;
        const esPendiente = !h.fecha_validacion && !h.fecha_planificacion;
        const esValidada = !!h.fecha_validacion;

        const cumpleEstadoHoras =
          (filterPlanificadas && esPlanificada) ||
          (filterPendientes && esPendiente) ||
          (filterValidadas && esValidada);

        if (!cumpleEstadoHoras) return false;
      }

      // Si pasa todos los filtros activos
      return true;
    });
  }, [
    horas,
    mostrarSoloPendientes,
    searchTerm,
    filterStart,
    filterEnd,
    filterUsuario,
    filterObraText,
    estadosSeleccionados,
    estadosObra.length,
    tiposSeleccionados,
    tiposObra.length,
    filterPlanificadas,
    filterPendientes,
    filterValidadas,
  ]);

  // ------------------- PAGINACIÓN ------------------- //
  //#region PAGINACION

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const horasActuales = horasFiltradas.slice(indexOfFirst, indexOfLast);
  const totalPaginas = Math.max(
    1,
    Math.ceil(horasFiltradas.length / itemsPerPage)
  );
  const startPage =
    Math.floor((currentPage - 1) / maxPaginasVisibles) * maxPaginasVisibles + 1;
  const endPage = Math.min(startPage + maxPaginasVisibles - 1, totalPaginas);

  const paginasVisibles = [];
  for (let i = startPage; i <= endPage; i++) paginasVisibles.push(i);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPaginas) return;
    setCurrentPage(page);
  };

  // ------------------- SELECCIÓN DE FILAS ------------------- //

  const getRowKey = (h) =>
    `${h.codigo_usuario ?? "u"}|${h.dia_trabajado ?? ""}|${
      h.codigo_obra ?? ""
    }`;

  const horasActualesKeys = horasActuales.map(getRowKey);
  const isAllSelectedOnPage =
    horasActualesKeys.length > 0 &&
    horasActualesKeys.every((k) => selectedIds.includes(k));

  const handleToggleSelectAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedIds((prev) =>
        Array.from(new Set([...prev, ...horasActualesKeys]))
      );
    } else {
      setSelectedIds((prev) =>
        prev.filter((k) => !horasActualesKeys.includes(k))
      );
    }
  };

  const handleToggleRow = (key) => {
    setSelectedIds((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // ------------------- ACCIONES ------------------- //

  const handleNuevaHora = () => {
    navigate("/home/nueva-hora");
  };

  const handleBuscar = () => {
    setCurrentPage(1);
    setMostrarListado(true);
  };

  const limpiarFiltros = () => {
    setMostrarSoloPendientes(false);
    setSearchTerm("");
    setFilterStart("");
    setFilterEnd("");
    setFilterUsuario("");
    setFilterObraText("");
    setFilterPlanificadas(true);
    setFilterPendientes(true);
    setFilterValidadas(true);

    const todosLosEstados = estadosObra.map((e) => e.descripcion_estado);
    setEstadosSeleccionados(todosLosEstados);
    const todosLosTipos = tiposObra.map((t) => t.descripcion);
    setTiposSeleccionados(todosLosTipos);

    setCurrentPage(1);
  };

  // ------------------- RENDER ------------------- //
  //#region RENDER
  return (
    <div className="horas-list">
      {/* ALERT */}
      {loading ? (
        <Alert variant="info" style={{ cursor: "pointer" }}>
          Cargando días pendientes...
        </Alert>
      ) : (
        <Alert
          variant="warning"
          onClick={() => {
            setMostrarSoloPendientes(true);
            setMostrarListado(true);
          }}
          style={{ cursor: "pointer" }}
          title="Pulsa para ver solo las horas pendientes"
        >
          <strong>Hay {diasPendientes}</strong> días con horas pendientes de
          validar. (pulsa aquí para ver)
        </Alert>
      )}

      {/* FILTROS */}
      <Container>
        <Row className="align-items-center mb-3">
          <Col md={8}>
            <Card className="mt-3">
              <Card.Header>
                <Button
                  variant="link"
                  onClick={() => setOpen(!open)}
                  aria-controls="filtros-collapse"
                  aria-expanded={open}
                  style={{ textDecoration: "none" }}
                >
                  Criterios de búsqueda {open ? "▲" : "▼"}
                </Button>
              </Card.Header>

              <Collapse in={open}>
                <div id="filtros-collapse">
                  <Card.Body>
                    <Form>
                      {/* Fechas y Usuario */}
                      <Row className="g-2 align-items-end">
                        <Col md={4}>
                          <Form.Group controlId="filtroStart">
                            <Form.Label>Fecha inicio</Form.Label>
                            <Form.Control
                              type="date"
                              value={filterStart}
                              onChange={(e) => setFilterStart(e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group controlId="filtroEnd">
                            <Form.Label>Fecha fin</Form.Label>
                            <Form.Control
                              type="date"
                              value={filterEnd}
                              onChange={(e) => setFilterEnd(e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group controlId="filtroUsuario">
                            <Form.Label>Usuario</Form.Label>
                            <Form.Select
                              value={filterUsuario}
                              onChange={(e) => setFilterUsuario(e.target.value)}
                            >
                              <option value="">[Todos los subordinados]</option>
                              {usuariosUnicos.map((u) => (
                                <option
                                  key={u.codigo_usuario}
                                  value={u.codigo_usuario}
                                >
                                  {u.nombre} ({u.codigo_usuario})
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Obra y Tarea */}
                      <Row className="mt-3">
                        <Col md={4}>
                          <Form.Group controlId="filtroObra">
                            <Form.Label>Obra</Form.Label>
                            <Form.Control
                              list="lista-obras-filtro"
                              value={filterObraText}
                              onChange={(e) =>
                                setFilterObraText(e.target.value)
                              }
                              placeholder="Buscar obra..."
                            />
                            <datalist id="lista-obras-filtro">
                              {obrasUnicas.map((o) => (
                                <option
                                  key={o.codigo_obra}
                                  value={`${o.codigo_obra} - ${o.descripcion}`}
                                />
                              ))}
                            </datalist>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group controlId="filtroTarea">
                            <Form.Label>Tarea</Form.Label>
                            <Form.Control placeholder="Busca tarea..." />
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Estado y Tipo de Obra */}
                      <Row className="mt-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Estado obra</Form.Label>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                id="dropdown-estado-obra"
                                className="w-100"
                              >
                                Seleccionar estados
                              </Dropdown.Toggle>
                              <Dropdown.Menu
                                style={{ padding: 12, minWidth: 240 }}
                              >
                                {estadosObra.length > 0 ? (
                                  estadosObra.map((estado, index) => (
                                    <Form.Check
                                      key={index}
                                      type="checkbox"
                                      id={`estado-${index}`}
                                      label={estado.descripcion_estado}
                                      className="mb-2"
                                      checked={estadosSeleccionados.includes(
                                        estado.descripcion_estado
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setEstadosSeleccionados((prev) => [
                                            ...prev,
                                            estado.descripcion_estado,
                                          ]);
                                        } else {
                                          setEstadosSeleccionados((prev) =>
                                            prev.filter(
                                              (item) =>
                                                item !==
                                                estado.descripcion_estado
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  ))
                                ) : (
                                  <div className="text-muted px-2">
                                    No hay estados disponibles
                                  </div>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Tipo de obra</Form.Label>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                id="dropdown-tipo-obra"
                                className="w-100"
                              >
                                Seleccionar tipos
                              </Dropdown.Toggle>
                              <Dropdown.Menu
                                style={{ padding: 12, minWidth: 240 }}
                              >
                                {tiposObra.length > 0 ? (
                                  tiposObra.map((tipo, index) => (
                                    <Form.Check
                                      key={index}
                                      type="checkbox"
                                      id={`tipo-${index}`}
                                      label={tipo.descripcion}
                                      className="mb-2"
                                      checked={tiposSeleccionados.includes(
                                        tipo.descripcion
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setTiposSeleccionados((prev) => [
                                            ...prev,
                                            tipo.descripcion,
                                          ]);
                                        } else {
                                          setTiposSeleccionados((prev) =>
                                            prev.filter(
                                              (item) =>
                                                item !== tipo.descripcion
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  ))
                                ) : (
                                  <div className="text-muted px-2">
                                    No hay tipos disponibles
                                  </div>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Estados Horas */}
                      <Row className="mt-3">
                        <Col>
                          <Form.Label>Estados Horas</Form.Label>
                          <div className="d-flex gap-3 flex-wrap">
                            <Form.Check
                              type="checkbox"
                              id="filtro-planificadas"
                              label="Planificadas"
                              checked={filterPlanificadas}
                              onChange={(e) =>
                                setFilterPlanificadas(e.target.checked)
                              }
                            />
                            <Form.Check
                              type="checkbox"
                              id="filtro-pendientes"
                              label="Pendientes de validar"
                              checked={filterPendientes}
                              onChange={(e) =>
                                setFilterPendientes(e.target.checked)
                              }
                            />
                            <Form.Check
                              type="checkbox"
                              id="filtro-validadas"
                              label="Validadas"
                              checked={filterValidadas}
                              onChange={(e) =>
                                setFilterValidadas(e.target.checked)
                              }
                            />
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </div>
              </Collapse>
            </Card>

            {/* Búsqueda y botones */}
            <Row className="align-items-center mt-3">
              <Col>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Buscar por usuario o fecha..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ minWidth: 250 }}
                  />
                  <Button
                    variant="primary"
                    onClick={handleBuscar}
                    style={{ minWidth: "100px" }}
                  >
                    Buscar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={limpiarFiltros}
                    style={{ minWidth: "150px" }}
                  >
                    🔄 Limpiar Filtros
                  </Button>
                  {mostrarSoloPendientes && (
                    <span className="badge bg-warning text-dark">
                      📌 Mostrando solo pendientes
                    </span>
                  )}
                </div>
              </Col>
            </Row>
          </Col>

          {/* BOTONES DE ACCIONES */}
          <Col md={4} className="text-end">
            <Button className="custom-button" onClick={handleNuevaHora}>
              🆕 Nueva Hora
            </Button>
            <Button className="custom-button">📃 Imputacion Semanal</Button>
            <Button className="custom-button">⛔ Baja Horas</Button>
            <Button className="custom-button">📰 Confirmar Horas</Button>
            <Button className="custom-button">✅ Validar Horas</Button>
            <Button className="custom-button">🏉 Cambiar Horas de obra</Button>
            <Button className="custom-button">🖨️ Imprimir Horas</Button>
          </Col>
        </Row>
      </Container>

      {/* TABLA */}
      <div className="table-container">
        {mostrarListado && (
          <>
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: "center" }}>
                    <Form.Check
                      type="checkbox"
                      checked={isAllSelectedOnPage}
                      onChange={handleToggleSelectAll}
                      aria-label="Seleccionar todos en página"
                    />
                  </th>
                  <th>Dia Trab.</th>
                  <th>Usuario</th>
                  <th>C.Obra</th>
                  <th>Descripcion</th>
                  <th>Hrs</th>
                  <th>Tarea</th>
                  <th>UsuV</th>
                  <th>Validado</th>
                  <th>Observaciones</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {horasActuales.length > 0 ? (
                  horasActuales.map((h, idx) => {
                    const rowKey = getRowKey(h);
                    return (
                      <tr key={idx}>
                        <td style={{ textAlign: "center" }}>
                          <Form.Check
                            type="checkbox"
                            checked={selectedIds.includes(rowKey)}
                            onChange={() => handleToggleRow(rowKey)}
                          />
                        </td>
                        <td>{formatearFecha(h.dia_trabajado)}</td>
                        <td>
                          {[h.nombre, h.apellido1, h.apellido2]
                            .filter(Boolean)
                            .join(" ") || `Usuario ${h.codigo_usuario}`}
                        </td>
                        <td>{h.codigo_obra ?? "-"}</td>
                        <td>{h.descripcion_obra ?? "-"}</td>
                        <td>{h.num_horas ?? "-"}</td>
                        <td>{h.tarea ?? "-"}</td>
                        <td>
                          {[
                            h.nombre_validador,
                            h.apellido1_validador,
                            h.apellido2_validador,
                          ]
                            .filter(Boolean)
                            .join(" ") || "--"}
                        </td>
                        <td>
                          {h.fecha_validacion
                            ? formatearFecha(h.fecha_validacion)
                            : "[NO]"}
                        </td>
                        <td>{String(h.observaciones || "").trim() || "--"}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/home/registro-horas/detalle/${h.codigo_usuario}`,
                                {
                                  state: { detalleHora: h },
                                }
                              )
                            }
                          >
                            Detalle
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center">
                      No hay registros que mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Paginación */}
            <Pagination>
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              {startPage > 1 && (
                <Pagination.Prev
                  onClick={() => handlePageChange(startPage - 1)}
                />
              )}
              {paginasVisibles.map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              {endPage < totalPaginas && (
                <Pagination.Next
                  onClick={() => handlePageChange(endPage + 1)}
                />
              )}
              <Pagination.Last
                onClick={() => handlePageChange(totalPaginas)}
                disabled={currentPage === totalPaginas}
              />
            </Pagination>
          </>
        )}
      </div>
    </div>
  );
};

export default HorasList;
