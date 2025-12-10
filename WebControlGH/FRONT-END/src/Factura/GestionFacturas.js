import React, { useEffect, useState } from "react";
import {
  Collapse,
  Form,
  Button,
  Table,
  Pagination,
  Container,
  Row,
  Col,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import "../css/FacturaDetalle.css";
import axios from "axios";

let allFacturas = null;

function GestionFacturas() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    codigo_obra: "",
    num_factura: "",
    importe: "",
    fechaAlta: "",
    codigoUsuarioAlta: "",
    fechaActualizacion: "",
    fechaBaja: "",
    codigoUsuarioBaja: "",
    observaciones: "",
    version: "",
  });

  const [filteredFacturas, setFilteredFacturas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const facturasPorPagina = 5;
  const [selectedFacturas, setSelectedFacturas] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    const endpoint = "http://localhost:3002/api/facturas";
    try {
      const res = await axios.get(endpoint);
      allFacturas = res.data.data;
      setFilteredFacturas(res.data.data);
    } catch (err) {
      console.error("Error al obtener facturas", err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNuevaFactura = () => {
    navigate("/home/nueva-factura");
  };

  // Función para manejar la copia de obras seleccionadas
  const handleCopiarFacturas = () => {
    if (selectedFacturas.length === 0) {
      alert("Por favor, selecciona al menos una factura para copiar.");
      return;
    }
    console.log("Facturas seleccionadas para copiar:", selectedFacturas);
  };

  /**
   * Función que que realiza la petición DELETE sobre una factura.
   * Está función que está estrechamente ligada con el dar de baja de una factura.
   *
   * @see {handleBajaFactura}
   *
   * @note Esta petición requiere en el código del usuario que la dio de baja.
   * Como actualmente no se maneja la autenticación de usuario, se indicó que el código de usuario,
   * siempre será el 4. Pero esto en una versión futura más estable se debe de cambiar.
   *
   * @param {number} selectedFacturas factura seleccionada para eliminar.
   * @returns {boolean} true si todo ha ido como se esperaba, falso en caso contrario.
   */
  const deleteFactura = async (selectedFacturas) => {
    try {
      const deletePromises = Array.from(selectedFacturas).map(async (id) => {
        await axios.delete(`http://localhost:3002/api/facturas/${id}`, {
          data: { codigoUsuarioBaja: 4 },
        });
        console.log(`Factura ${id} eliminada satisfactoriamente`);
      });
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error(
        "Error al eliminar facturas:",
        error.response?.data || error.message
      );
      return false;
    }
  };

  /**
   * Función que se encarga de establecer una factura como dada de baja.
   * De esta forma, la factura sigue siendo accessible pero reflejando claramente que está de baja.
   *
   * @see {deleteFactura}
   *
   * @returns {void}
   */
  const handleBajaFactura = async () => {
    if (selectedFacturas.length === 0) {
      alert("Por favor, selecciona al menos una factura para eliminar.");
      return;
    }
    if (
      window.confirm("¿Estás seguro de eliminar las facturas seleccionadas?")
    ) {
      try {
        const success = await deleteFactura(selectedFacturas);
        if (success) {
          await fetchFacturas();

          // Importante limpiar la seleccion de facturas porque
          // sino el componente ImprimirFacturas da un error puntual al imprimir
          // factura justo después de haber eliminado
          setSelectedFacturas([]);

          alert("Facturas eliminadas correctamente");
        } else {
          alert("Error al eliminar algunas facturas");
        }
      } catch (error) {
        console.error("Error en el proceso de borrado", error);
      }
    }
  };

  /**
   * Función que se encarga de imprimir una factura seleccionada.
   *
   * @returns {void}
   */
  const handleImprimirFacturas = () => {
    if (selectedFacturas.length === 0) {
      alert("Por favor, selecciona al menos una factura para imprimir.");
      return;
    }
    console.log(
      "GestionFacturas: Facturas seleccionadas para imprimir",
      selectedFacturas
    );
    navigate("/home/imprimir-factura", {
      state: { selectedFacturas: selectedFacturas },
    });
  };

  const handleCheckboxChange = (facturaId) => {
    setSelectedFacturas((prevSelected) => {
      if (prevSelected.includes(facturaId)) {
        return prevSelected.filter((id) => id !== facturaId);
      } else {
        return [...prevSelected, facturaId];
      }
    });
  };

  const handleSearch = () => {
    let filtered = allFacturas;

    if (formData.fechaInicio) {
      filtered = filtered.filter(
        (factura) =>
          new Date(factura.fecha_cabecera) >= new Date(formData.fechaInicio)
      );
    }

    if (formData.fechaFin) {
      filtered = filtered.filter(
        (factura) =>
          new Date(factura.fecha_cabecera) <= new Date(formData.fechaFin)
      );
    }

    if (formData.pendientePago) {
      filtered = filtered.filter((factura) =>
        formData.pendientePago === "si"
          ? factura.cobrado === 0
          : factura.cobrado === 1
      );
    }

    if (formData.obra) {
      filtered = filtered.filter((factura) =>
        factura.obra.includes(formData.obra)
      );
    }

    if (formData.pedido) {
      filtered = filtered.filter((factura) =>
        String(factura.pedido_pos).includes(formData.pedido)
      );
    }

    if (formData.origenFactura) {
      filtered = filtered.filter((factura) =>
        factura.origen.includes(formData.origenFactura)
      );
    }

    setFilteredFacturas(filtered);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedFacturas(filteredFacturas.map((factura) => factura.id));
    } else {
      setSelectedFacturas([]);
    }
  };

  const indexOfLastFactura = currentPage * facturasPorPagina;
  const indexOfFirstFactura = indexOfLastFactura - facturasPorPagina;
  const facturasActuales = filteredFacturas.slice(
    indexOfFirstFactura,
    indexOfLastFactura
  );
  const totalPaginas = Math.ceil(filteredFacturas.length / facturasPorPagina);

  // Calcular el rango de páginas a mostrar
  const maxPaginasVisibles = 10;
  const startPage =
    Math.floor((currentPage - 1) / maxPaginasVisibles) * maxPaginasVisibles + 1;
  const endPage = Math.min(startPage + maxPaginasVisibles - 1, totalPaginas);

  // Generar array de páginas visibles
  const paginasVisibles = [];
  for (let i = startPage; i <= endPage; i++) {
    paginasVisibles.push(i);
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="gestion-facturas">
      <h3>Listado de Facturas</h3>

      <div style={{ textAlign: "left" }}>
        <Button
          onClick={() => setOpen(!open)}
          aria-controls="criterios-collapse"
          aria-expanded={open}
          style={{
            backgroundColor: "#cce5ff",
            color: "#004085",
            border: "none",
            marginBottom: "1rem",
          }}
        >
          Criterios de Búsqueda
        </Button>
      </div>

      <Collapse in={open}>
        <div
          id="criterios-collapse"
          className="mb-4 p-3 border rounded"
          style={{ backgroundColor: "#e9f5ff" }}
        >
          <Form>
            <div className="row">
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>Obra</Form.Label>
                  <Form.Control
                    type="text"
                    name="idObra"
                    value={formData.idObra}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>
                    ID Factura Compra
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="idFacturaCompra"
                    value={formData.idFacturasCompras}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>Importe</Form.Label>
                  <Form.Select
                    name="importe"
                    value={formData.importe}
                    onChange={handleChange}
                  ></Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>
                    Fecha de Alta
                  </Form.Label>
                  <Form.Select
                    type="date"
                    name="fechaAlta"
                    value={formData.fechaAlta}
                    onChange={handleChange}
                  ></Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>
                    Código Usuario Alta
                  </Form.Label>
                  <Form.Select
                    name="codigoUsuarioAlta"
                    value={formData.codigoUsuarioAlta}
                    onChange={handleChange}
                  ></Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>
                    Fecha de Actualización
                  </Form.Label>
                  <Form.Select
                    type="date"
                    name="fechaActualizacion"
                    value={formData.fechaActualizacion}
                    onChange={handleChange}
                  ></Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>
                    Fecha de Baja
                  </Form.Label>
                  <Form.Select
                    type="date"
                    name="fechaBaja"
                    value={formData.fechaBaja}
                    onChange={handleChange}
                  ></Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>
                    Código Usuario de Baja
                  </Form.Label>
                  <Form.Select
                    name="codigoUsuarioBaja"
                    value={formData.codigoUsuarioBaja}
                    onChange={handleChange}
                  ></Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>
                    Observaciones
                  </Form.Label>
                  <Form.Select
                    type="text"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                  ></Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-3">
                <Form.Group>
                  <Form.Label style={{ color: "black" }}>Versión</Form.Label>
                  <Form.Select
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                  ></Form.Select>
                </Form.Group>
              </div>
            </div>
          </Form>
        </div>
      </Collapse>

      <div className="d-flex mb-4">
        <Form.Control
          type="text"
          placeholder="Busque por nombre y descripción"
          className="me-2"
          style={{ maxWidth: "265px" }}
        />
        <Button
          variant="primary"
          onClick={handleSearch}
          style={{ width: "auto" }}
        >
          Buscar
        </Button>
      </div>

      <Container>
        <Row className="mb-2" md={3}>
          {/* <Col md={4} className="text-end"> */}
          <Button onClick={handleNuevaFactura} className="custom-button">
            Nueva Factura
          </Button>
          <Button onClick={handleBajaFactura} className="custom-button">
            Baja Factura
          </Button>
          <Button onClick={handleCopiarFacturas} className="custom-button">
            Importar Facturas desde DQEMS
          </Button>
          <Button onClick={handleImprimirFacturas} className="custom-button">
            Imprimir Facturas
          </Button>
          {/* </Col> */}
        </Row>
      </Container>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
            <th style={{ width: "60px" }}>Obra</th>
            <th>Factu Compras</th>
            <th>Importe</th>
            <th>Fecha Alta</th>
            <th>Fecha Actu</th>
            <th>Fecha Baja</th>
            <th>User Alta</th>
            <th>User Baja</th>
            <th style={{ width: "60px" }}>Observaciones</th>
            <th>Versión</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {facturasActuales.length > 0 ? (
            facturasActuales.map((factura, index) => (
              <tr key={index}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedFacturas.includes(factura.id)}
                    onChange={() => handleCheckboxChange(factura.id)}
                  />
                </td>
                <td 
                  className="text-truncate" 
                  style={{ maxWidth: "100px" }}
                  title={factura.codigo_obra}
                >
                  {factura.codigo_obra ?? "-"}
                </td>
                <td>{factura.num_factura ?? "-"}</td>
                <td>{factura.importe}</td>
                <td>
                  {factura.fecha_alta
                    ? new Date(factura.fecha_alta).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {factura.fecha_actualizacion
                    ? new Date(factura.fecha_actualizacion).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {factura.fecha_baja
                    ? new Date(factura.fecha_baja).toLocaleDateString()
                    : "-"}
                </td>
                <td>{factura.codigo_usuario_alta ?? "-"}</td>
                <td>{factura.codigo_usuario_baja ?? "-"}</td>
                <td
                className="text-truncate" 
                  style={{ maxWidth: "100px" }}
                  title={factura.observaciones}
                >{factura.observaciones ?? "-"}</td>
                <td>{factura.version}</td>
                <td>
                  <Button
                    variant="info"
                    onClick={() =>
                      navigate(`/home/gestion-facturas/detalle/${factura.id}`)
                    }
                  >
                    Detalle
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12">No se encontraron facturas</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Pagination>
        <Pagination.First onClick={() => handlePageChange(1)} />
        {startPage > 1 && (
          <Pagination.Prev onClick={() => handlePageChange(startPage - 1)} />
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
          <Pagination.Next onClick={() => handlePageChange(endPage + 1)} />
        )}
        <Pagination.Last onClick={() => handlePageChange(totalPaginas)} />
      </Pagination>
    </div>
  );
}

export default GestionFacturas;
