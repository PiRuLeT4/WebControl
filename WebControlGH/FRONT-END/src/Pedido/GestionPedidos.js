import React, { useState, useEffect } from "react";
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
import axios from "axios";
import "../css/FacturaDetalle.css";

let allPedidos = null;

function GestionPedidos() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fechaInicio: "",
    fechaFin: "",
    estado: "",
    cliente: "",
    referencia: "",
  });
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pedidosPorPagina = 5;
  const [selectedPedidos, setSelectedPedidos] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  // Funcion para recuperar los pedidos del endpoint
  const fetchPedidos = async () => {
    try {
      const response = await axios.get("http://localhost:3002/pedidos");
      allPedidos = response.data;
      setFilteredPedidos(allPedidos);
    } catch (err) {
      console.error(`Error al obtener los pedidos - ${err}`);
    }
  };

  // UseEffect que se ejecuta una vez cuando el componente se monta
  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handler para la selección total
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    if (newSelectAll) {
      setSelectedPedidos(filteredPedidos.map((pedido) => pedido.id));
    } else {
      setSelectedPedidos([]);
    }
  };

  const handleSearch = () => {
    let filtered = allPedidos;

    if (formData.fechaInicio) {
      filtered = filtered.filter(
        (pedido) => new Date(pedido.fecha) >= new Date(formData.fechaInicio)
      );
    }

    if (formData.fechaFin) {
      filtered = filtered.filter(
        (pedido) => new Date(pedido.fecha) <= new Date(formData.fechaFin)
      );
    }

    if (formData.estado) {
      filtered = filtered.filter((pedido) => pedido.estado === formData.estado);
    }

    if (formData.cliente) {
      filtered = filtered.filter((pedido) =>
        pedido.cliente.toLowerCase().includes(formData.cliente.toLowerCase())
      );
    }

    if (formData.referencia) {
      filtered = filtered.filter((pedido) =>
        pedido.referencia.includes(formData.referencia)
      );
    }

    setFilteredPedidos(filtered);
  };

  const handleCheckboxChange = (pedidoId) => {
    setSelectedPedidos((prev) =>
      prev.includes(pedidoId)
        ? prev.filter((id) => id !== pedidoId)
        : [...prev, pedidoId]
    );
  };

  // Handler para la creacion de pedidos
  const handleCrearPedido = () => {
    navigate("/home/nuevo-pedido");
  };

  // Funcion para eliminar pedidos
  const deletePedidos = async (selectedPedidos) => {
    try {
      const eliminaciones = Array.from(selectedPedidos).map(async (id) => {
        await axios.delete(`http://localhost:3002/pedidos/${id}`);
      });
      await Promise.all(eliminaciones);
      return true;
    } catch (err) {
      console.error(`Error al eliminar los pedidos - ${err}`);
      return false;
    }
  };

  // Handler para la eliminacion de pedidos
  const handleDeletePedidos = async () => {
    if (selectedPedidos.length === 0) {
      alert("Por favor, selecciona al menos una factura para eliminar.");
      return;
    }
    if (
      window.confirm(
        "¿Estás seguro de querer eliminar los pedidos seleccionados?"
      )
    ) {
      try {
        const success = await deletePedidos(selectedPedidos);
        if (success) {
          await fetchPedidos();

          // Reseteamos selección de pedidos
          setSelectedPedidos([]);
          alert("Pedidos eliminados correctamente");
        }
      } catch (err) {
        alert("Error al eliminar los pedidos");
        console.error(`Error al eliminar los pedidos - ${err}`);
      }
    }
  };

  const handleImprimirPedidos = () => {
    if (selectedPedidos.length === 0) {
      alert("Selecciona al menos un pedido para imprimir.");
      return;
    }
    navigate("/home/imprimir-pedido", {
      state: { selectedPedidos: selectedPedidos },
    });
  };

  const indexOfLastPedido = currentPage * pedidosPorPagina;
  const indexOfFirstPedido = indexOfLastPedido - pedidosPorPagina;
  const pedidosActuales = filteredPedidos.slice(
    indexOfFirstPedido,
    indexOfLastPedido
  );
  const totalPaginas = Math.ceil(filteredPedidos.length / pedidosPorPagina);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="gestion-pedidos">
      <h3>Listado de Pedidos</h3>

      <div style={{ textAlign: "left" }}>
        <Button
          onClick={() => setOpen(!open)}
          aria-controls="filtros-collapse"
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
          id="filtros-collapse"
          className="mb-4 p-3 border rounded"
          style={{ backgroundColor: "#e9f5ff" }}
        >
          <Form>
            <div className="row">
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Fecha Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Fecha Fin</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    placeholder="Nombre del cliente"
                  />
                </Form.Group>
              </div>
              <div className="col-md-3 mt-3">
                <Form.Group>
                  <Form.Label>Referencia</Form.Label>
                  <Form.Control
                    type="text"
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleChange}
                    placeholder="Referencia de pedido"
                  />
                </Form.Group>
              </div>
            </div>
          </Form>
        </div>
      </Collapse>

      <div className="d-flex mb-4">
        <Form.Control
          type="text"
          placeholder="Buscar pedidos..."
          className="me-2"
          style={{ maxWidth: "150px" }}
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
        <Row className="mb-3">
          <Col className="text-end">
            <Button onClick={handleCrearPedido} className="custom-button">
              Nuevo Pedido
            </Button>
            <Button onClick={handleDeletePedidos} className="custom-button">
              Eliminar Pedido
            </Button>
            <Button onClick={handleImprimirPedidos} className="custom-button">
              Imprimir Pedidos
            </Button>
          </Col>
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
            <th>Referencia</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Importe</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pedidosActuales.length > 0 ? (
            pedidosActuales.map((pedido, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPedidos.includes(pedido.id)}
                    onChange={() => handleCheckboxChange(pedido.id)}
                  />
                </td>
                <td>{pedido.referencia}</td>
                <td>{pedido.cliente}</td>
                <td>{pedido.fecha}</td>
                <td>{pedido.estado}</td>
                <td>{pedido.importe}</td>
                <td>
                  <Button
                    variant="info"
                    onClick={() =>
                      navigate(`/home/gestion-pedidos/detalle/${pedido.id}`)
                    }
                  >
                    Detalle
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No se encontraron pedidos</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Pagination>
        {Array.from({ length: totalPaginas }, (_, i) => (
          <Pagination.Item
            key={i}
            active={i + 1 === currentPage}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
}

export default GestionPedidos;
