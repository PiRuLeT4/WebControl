import React, {useEffect, useState, useMemo} from "react";
import{
    Alert,
    Table,
    Button,
    Container,
    Col,
    Form,
    Row,
    Accordion
} from "react-bootstrap";
import axios from "axios";

function GastosList(){
    //ESTADOS
    const [diasPendientesValidar, setDiasPendientesValidar] = useState(0);
    const [mostrarPendientesValidar, setMostrarSoloPendientesValidar] = useState(false);
    

    const[mostrarListado, setMostrarListado] = useState(false);
    const[gastos, setGastos] = useState([]);
    const[search, setSearch] = useState("");
    const[loading, setLoading] = useState(true);

    const [open, setOpen] = useState(true);
    const [filterStart, setFilterStart] = useState("");
    const [filterStartPayment, setFilterStartPayment] = useState("");
    const [filterEnd, setFilterEnd] = useState("");
    const [filterEndPayment, setFilterEndPayment] = useState("");
    const [filterUsuario, setFilterUsuario] = useState("");
    const [filterObraText, setFilterObraText] = useState("");
    const [filterVisaPayment, setFilterVisaPayment] = useState("");

   //FETCH
    
   //FILTRADO

   //PAGINACION

   //ACCIONES



    //RENDER
    
    return(
        <div className="gastos-obras">
            {/*ALERT */}
            {loading ? (
                <Alert variant="info">
                    Cargando gastos pendientes...
                </Alert>
            ) : (
                <Alert 
                    variant="warning"
                    onClick={() => {
                        setMostrarSoloPendientesValidar(true);
                    }}
                    title="Pulsa para ver pendientes"
                    >
                        <strong>Hay {diasPendientesValidar}</strong> días con gastos pendientes de validar. Pulse para acceder a la lista.
                </Alert>
            )}
            {/* FILTROS */}
            <Container>
                <Row>
                    <Col md={8} className="Filters">
                        <Accordion
                            defaultActiveKey={open ? "0" : null}
                            onSelect={() => setOpen((o) => !o)}
                            >
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Criterios de búsqueda</Accordion.Header>
                                    <Accordion.Body>
                                        <Form>
                                            <Row>
                                                <Col md = {3}>
                                                    <Form.Group>
                                                        <Form.Label>Fecha Inicio Gasto</Form.Label>
                                                        <Form.Control type="date" size="sm" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} />
                                    
                                                    </Form.Group>
                                                </Col>
                                                <Col md = {3}>
                                                    <Form.Group>
                                                        <Form.Label>Fecha Fin Gasto</Form.Label>
                                                        <Form.Control type="date" size="sm" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col md = {3}>
                                                    <Form.Group>
                                                        <Form.Label> Usuario</Form.Label>
                                                        <Form.Select size="sm" value={filterUsuario} onChange={(e) => setFilterUsuario(e.target.value)}>

                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md = {3}>
                                                    <Form.Group>
                                                        <Form.Label>Obra</Form.Label>
                                                        <Form.Control 
                                                            size="sm"
                                                            list="lista-obras-filtro"
                                                            value={filterObraText}
                                                            onChange={(e) => setFilterObraText(e.target.value)}
                                                            placeholder="Buscar obra..." />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md = {3}>
                                                    <Form.Group>
                                                        <Form.Label>Fecha Inicio Pago</Form.Label>
                                                        <Form.Control type="date" size="sm" value={filterStartPayment} onChange={(e) => setFilterStartPayment(e.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col md = {3}>
                                                    <Form.Group>
                                                        <Form.Label>Fecha Fin Pago</Form.Label>
                                                        <Form.Control type="date" size="sm" value={filterEndPayment} onChange={(e) => setFilterEndPayment(e.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col md = {3}>
                                                    <Form.Group>
                                                        <Form.Label>Pagados Visa</Form.Label>
                                                        <Form.Select size="sm" value={filterVisaPayment} onChange={(e) => setFilterVisaPayment(e.target.value)}>

                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                
                                            </Row>
                                        </Form>
                                    </Accordion.Body>
                                </Accordion.Item>
                        </Accordion>
                    </Col>


                    {/*BOTONES ACCIONES*/}
                    <Col md={4} className="Actions">
                        <Button>Nuevo Gasto</Button>
                        <Button>Baja Gasto</Button>
                        <Button>Validar Gastos</Button>
                        <Button>Cambiar Gastos de Obra</Button>
                        <Button>Pagar Gastos</Button>
                        <Button>Imprimir Gastos</Button>
                    </Col>
                </Row>
            </Container>
            {/* TABLA */}
            <div className="table-container">
                <thead>
                    <tr>
                        <th>
                            
                            <Form.Check />
                        </th>
                        <th>ID</th>
                        <th>F.Gasto</th>
                        <th>Usu</th>
                        <th>C Obra</th>
                        <th>Descripcion</th>
                        <th>Tipo</th>
                        <th>Cant</th>
                        <th>i.u.</th>
                        <th>Total</th>
                        <th>Validado</th>
                        <th>UsuV</th>
                        <th>Visa</th>
                        <th>Pagado</th>
                        <th>UsuP</th>
                        <th>Obs</th>
                        <th>Accion</th>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </div>
        </div>
    );
};

export default GastosList;