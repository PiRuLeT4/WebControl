import React, { useState, useEffect } from "react";
import { Form, Button, Col, Row, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../css/NuevaHora.css";
import axios from "axios";
import { getSubordinadosUsuarioActual } from "./Services/userService";

const NuevaHora = () => {
  const navigate = useNavigate();
  const [dia, setDia] = useState("");
  const [codigoUsuario, setCodigoUsuario] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [obraText, setObraText] = useState("");
  const [obras, setObras] = useState([]);
  const [codigoObraSeleccionada, setCodigoObraSeleccionada] = useState("");
  const [numHoras, setNumHoras] = useState(8);
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsuarios();
    fetchObras();
  }, []);

  const fetchUsuarios = async () => {
    const data = await getSubordinadosUsuarioActual();
    setUsuarios(data);
  };

  const fetchObras = async () => {
    try {
      const res = await axios.get("http://localhost:3002/api/obra");
      const data = res.data?.data || [];
      setObras(data);
    } catch (err) {
      console.error("Error al obtener obras:", err);
      setObras([]);
    }
  };

  const handleCancel = () => {
    navigate("/home/registro-horas");
  };

  // Si se elige una obra desde el datalist, intentamos obtener su código asociado
  const handleObraChange = (value) => {
    setObraText(value);
    // buscar obra cuyo descripcion o codigo coincida con el texto
    const found = obras.find(
      (o) =>
        String(o.codigo_obra) === String(value) ||
        (o.descripcion || "").toLowerCase() === value.toLowerCase() ||
        (`${o.codigo_obra} - ${o.descripcion}` || "").toLowerCase() ===
          value.toLowerCase()
    );
    setCodigoObraSeleccionada(found ? found.codigo_obra : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // payload básico — ajustar según el endpoint real del backend
      const payload = {
        dia_trabajado: dia,
        codigo_usuario: codigoUsuario,
        codigo_obra: codigoObraSeleccionada || obraText,
        num_horas: numHoras ? Number(numHoras) : null,
        observaciones,
      };
      await axios.post("http://localhost:3002/api/horas", payload);
      navigate("/home/registro-horas");
    } catch (err) {
      console.error("Error al guardar nueva hora:", err);
      // no manejamos UI de error ahora
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="nueva-hora-container">
      <div className="nueva-hora">
        <Form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Editor de Hora Obra</legend>
            {/* Formulario para el dia trabajado */}
            <Form.Group as={Row} className="mb-3" controlId="formDia">
              <Form.Label column sm="2">
                Día trabajado:
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="date"
                  name="dia"
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                />
              </Col>
            </Form.Group>
            {/* Formulario para obtener el usuario */}
            <Form.Group as={Row} className="mb-3" controlId="formUsuario">
              <Form.Label column sm="2">
                Usuario:
              </Form.Label>
              <Col sm="10">
                <Form.Select
                  value={codigoUsuario}
                  onChange={(e) => setCodigoUsuario(e.target.value)}
                >
                  <option value="">-- Seleccionar usuario --</option>
                  {usuarios.map((u) => {
                    const nombre = [u.nombre, u.apellido1, u.apellido2]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <option key={u.codigo_usuario} value={u.codigo_usuario}>
                        {nombre || `Usuario ${u.codigo_usuario}`} (
                        {u.codigo_usuario})
                      </option>
                    );
                  })}
                </Form.Select>
              </Col>
            </Form.Group>

            {/* Formulario para obtener la obra */}
            <Form.Group as={Row} className="mb-3" controlId="formObra">
              <Form.Label column sm="2">
                Obra:
              </Form.Label>
              <Col sm="10">
                {/* input con datalist para búsqueda/autocompletado de obras */}
                <Form.Control
                  list="obras-list"
                  value={obraText}
                  onChange={(e) => handleObraChange(e.target.value)}
                  placeholder="Buscar obra por código o descripción..."
                />
                <datalist id="obras-list">
                  {obras.map((o) => {
                    const label = `${o.codigo_obra} - ${
                      o.descripcion || o.descripcion_obra || ""
                    }`;
                    return <option key={o.codigo_obra} value={label} />;
                  })}
                </datalist>
                {/* campo oculto o info del código detectado */}
                <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                  {codigoObraSeleccionada
                    ? `Código seleccionado: ${codigoObraSeleccionada}`
                    : "No se ha seleccionado código automáticamente"}
                </div>
              </Col>
            </Form.Group>

            {/* Formulario para obtener el numero de horas */}
            <Form.Group as={Row} className="mb-3" controlId="formNumHoras">
              <Form.Label column sm="2">
                Num horas:
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="number"
                  min="0"
                  step="1"
                  value={numHoras}
                  onChange={(e) => setNumHoras(e.target.value)}
                  placeholder="Introduce número de horas"
                />
              </Col>
            </Form.Group>

            {/* Formulario para observaciones */}
            <Form.Group as={Row} className="mb-3" controlId="formObservaciones">
              <Form.Label column sm="2">
                Observaciones:
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones (opcional)"
                />
              </Col>
            </Form.Group>

            <div className="actions" style={{ display: "flex", gap: 8 }}>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar hora"}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar cambios
              </Button>
            </div>
          </fieldset>
        </Form>
      </div>
    </Container>
  );
};

export default NuevaHora;
