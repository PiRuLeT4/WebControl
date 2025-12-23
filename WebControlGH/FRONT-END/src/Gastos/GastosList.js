import React, {useEffect, useState, useMemo} from "react";
import{
    Alert,
    Table,
    Button,
    Container,
    Col,
    Form,
    Row,
    Accordion,
    Dropdown
} from "react-bootstrap";
import axios from "axios";

function GastosList(){
    //ESTADOS
    const [diasPendientesValidar, setDiasPendientesValidar] = useState(0);
    const [mostrarPendientesValidar, setMostrarSoloPendientesValidar] = useState(false);
    

    const[mostrarListado, setMostrarListado] = useState(false);
    const[gastos, setGastos] = useState([]);
    const[loading, setLoading] = useState(true);

    const [open, setOpen] = useState(true);
    const [filterStart, setFilterStart] = useState("");
    const [filterStartPayment, setFilterStartPayment] = useState("");
    const [filterEnd, setFilterEnd] = useState("");
    const [filterEndPayment, setFilterEndPayment] = useState("");
    const [filterUsuario, setFilterUsuario] = useState("");
    const [filterObraText, setFilterObraText] = useState("");
    const [filterVisaPayment, setFilterVisaPayment] = useState("");

    const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
    const [tiposGasto, setTiposGastos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [itemsPerPage, setItemsPerPage] = useState(15);

    const [usuarios, setUsuarios] = useState([]);

    const [obras, setObras] = useState([]);

   //FETCH

   useEffect(() => {
        const fetchGastos = async() => {
            try{
                setLoading(true);
                
                const response = await axios.get("http://localhost:3002/api/gastos");

                const data = response.data || [];
                setGastos(data);
                setDiasPendientesValidar(
                    data.filter((g) => !g.validado).length
                );
            } catch(error){
                console.error("Error al cargar gastos:", error);
            }finally{
                setLoading(false);
            }
        };
        fetchGastos();
   }, []);

   useEffect(() => {
    const fetchTiposGasto = async () => {
        try{
            const response = await axios.get("http://localhost:3002/api/tipos-gasto");
            setTiposGastos(response.data || []);
        } catch (error){
            console.error("Error al cargar tipos de gasto:", error);
        }
    };
    fetchTiposGasto();

   }, []);

   useEffect(() => {
    const fetchUsuarios = async () => {
        try {
            const response = await axios.get("http://localhost:3002/api/usuarios");
            setUsuarios(response.data || []);
        } catch (error){
            console.error("Error al cargar usuarios:", error);
        }
    };
    fetchUsuarios();
   }, []);

   useEffect(() => {
    const fetchObras = async () => {
        try{
            const response = await axios.get("http://localhost:3002/api/obras");
            setObras(response.data || []);
        } catch (error){
            console.error("Error al cargar obras:", error);
        }
    };
    fetchObras();
   }, []);
    
   //FILTRADO
   const gastosFiltrados = useMemo(() => {
    let data = [...gastos];

    if(mostrarPendientesValidar){
        data = data.filter(g => !g.validado);
    }
    if(searchTerm){
        data = data.filter(g=>
            g.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    if(filterUsuario){
        data = data.filter(g => String(g.usuarioId) === String(filterUsuario));
    }
    if(filterObraText){
        data = data.filter(g => g.obra?.toLowerCase().includes(filterObraText.toLowerCase()));
    }
    if(tiposSeleccionados.length > 0){
        data = data.filter(g => tiposSeleccionados.includes(g.tipo));
    }
    if(filterStart){
        data = data.filter(g => g.fecha >= filterStart);
    }
    if(filterEnd){
        data = data.filter(g => g.fecha <= filterEnd);
    }
    if(filterStartPayment){
        data = data.filter(g => g.fechaPago >= filterStartPayment);
    }
    if(filterEndPayment){
        data = data.filter(g => g.fechaPago <= filterEndPayment);
    }
    return data;
   }, [gastos,
        mostrarPendientesValidar,
        searchTerm,
        filterUsuario,
        filterObraText,
        tiposSeleccionados]);
   
   
   //PAGINACION
   const totalPages = useMemo(() => {
    return Math.ceil(gastosFiltrados.length / itemsPerPage);
   }, [gastosFiltrados.length, itemsPerPage]);

   const paginatedGastos = useMemo(() => {
    const startIndex = (currentPage -1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return gastosFiltrados.slice(startIndex, endIndex);
   }, [gastosFiltrados, currentPage, itemsPerPage]);

   //ACCIONES
    //flechas de movimiento entre paginas
   const goFirstPage = () => setCurrentPage(1);

   const goPrevPage = () =>{
    setCurrentPage((prev) => Math.max(1, prev -1));
   };

   const goNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
   };

   const goLastPage = () => setCurrentPage(totalPages);



    //buscar y limpiar
   const handleBuscar = () => {
        setCurrentPage(1);
        setMostrarListado(true);
   };

   const limpiarFiltros = () => {
    setFilterStart("");
    setFilterEnd("");
    setFilterUsuario("");
    setFilterObraText("");
    setFilterStartPayment("");
    setFilterEndPayment("");
    setFilterVisaPayment("");
    setTiposSeleccionados([]);
    setSearchTerm("");
    setMostrarSoloPendientesValidar(false);
    setCurrentPage(1);
   };



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
                        setMostrarListado(true);
                        setCurrentPage(1);
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
                                                        <Form.Select
                                                        size="sm"
                                                        value={filterUsuario}
                                                        onChange={(e) => setFilterUsuario(e.target.value)}>
                                                            <option value="">Todos</option>
                                                            {usuarios.map((u) =>(
                                                                <option key={u.id} value={u.id}>
                                                                    {u.nombre}
                                                                </option>
                                                            ))}
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

                                                            <datalist id="lista-obras-filtro">
                                                                {obras.map((obra) => (
                                                                    <option key={obra.id} value={obra.nombre} />
                                                                ))}
                                                            </datalist>
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
                                                <Col md = {4}>
                                                    <Form.Group>
                                                        <Form.Label>Pendientes de validar</Form.Label>
                                                        <Form.Check></Form.Check>
                                                    </Form.Group>
                                                </Col>
                                                <Col md = {4}>
                                                    <Form.Group>
                                                        <Form.Label>Gastos Validados (Ptes. pago)</Form.Label>
                                                        <Form.Check></Form.Check>
                                                    </Form.Group>
                                                </Col>
                                                <Col md = {4}>
                                                    <Form.Group>
                                                        <Form.Label>Gastos Pagados</Form.Label>
                                                        <Form.Check></Form.Check>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                {/* Desplegable*/}
                                                <Col md= {6}>
                                                    <Form.Group>
                                                        <Form.Label>Tipos de Gasto</Form.Label>
                                                        <Dropdown>
                                                            <Dropdown.Toggle>
                                                                Tipos
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                {tiposGasto.length > 0 ? (
                                                                    tiposGasto.map((tipo,index) => (
                                                                        <Form.Check 
                                                                        key={index}
                                                                        type="checkbox"
                                                                        id={`tipo-${index}`}
                                                                        label={<small>{tipo.descripcion}</small>}
                                                                        checked={tiposSeleccionados.includes(tipo.descripcion
                                                                        )}
                                                                        onChange={(e) => {
                                                                            if(e.target.checked){
                                                                                setTiposSeleccionados((prev) =>[
                                                                                    ...prev,
                                                                                    tipo.descripcion,
                                                                                ]);
                                                                            } else{
                                                                                setTiposSeleccionados((prev) =>
                                                                                    prev.filter(
                                                                                        (item)=> item !== tipo.descripcion
                                                                                    )
                                                                                );
                                                                            }
                                                                        }}/>
                                                                    ))
                                                                ) : (
                                                                    <div>
                                                                        <small>No hay tipos disponibles</small>
                                                                    </div>
                                                                )}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </Form.Group>
                                                </Col>
                                                {/*Espaciado */}
                                                <Col md={4}></Col>
                                                    {/*Botones*/}
                                                <Col md={2}>
                                                    <div>
                                                        <Button
                                                            onClick={handleBuscar}
                                                        >Buscar</Button>
                                                        <Button
                                                            onClick={limpiarFiltros}
                                                        >Limpiar</Button>
                                                    </div>
                                                </Col>

                                            </Row>
                                        </Form>
                                    </Accordion.Body>
                                </Accordion.Item>
                        </Accordion>
                        {/*Busqueda por texto */}
                        <Row>
                            <Col>
                                <div>
                                    <Form.Control
                                    type="text"
                                    placeholder="Buscar por nombre o descripcion"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    style={{minWidth:250, maxWidth:300}}/>
                                    {mostrarPendientesValidar && (
                                        <span className="badge bg-warning text-dark">
                                            Mostrando pendientes
                                        </span>
                                    )}
                                </div>           
                            </Col>
                        </Row>
                    </Col>

                    {/*BOTONES ACCIONES*/}
                    <Col md={4} className="Actions">
                        <Button>📃 Nuevo Gasto</Button>
                        <Button>⛔ Baja Gasto</Button>
                        <Button>✅ Validar Gastos</Button>
                        <Button>🏉 Cambiar Gastos de Obra</Button>
                        <Button>Pagar Gastos</Button>
                        <Button>🖨️ Imprimir Gastos</Button>
                    </Col>
                </Row>
            </Container>
            {/*Paginacion listado */}
            <Container>
                <Row>
                    <Col md={4} className="d-flex align-items-center gap-2">
                        <Button
                            size = "sm"
                            variant="outline-secondary"
                            onClick={goFirstPage}
                            disabled={currentPage === 1}
                        >
                            ⏮
                        </Button>

                        <Button
                            size ="sm"
                            variant="outline-secondary"
                            onClick={goPrevPage}
                            disabled={currentPage === 1}
                        >◀</Button>

                        <span>
                            Pagina <strong>{currentPage}</strong> de <strong>{totalPages || 1}</strong>
                        </span>

                        <Button
                            size = "sm"
                            variant="outline-secondary"
                            onClick={goNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            ▶
                        </Button>

                        <Button
                            size ="sm"
                            variant="outline-secondary"
                            onClick={goLastPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            ⏭
                        </Button>
                    </Col>

                    <Col md={4}>
                        <Form.Label> Paginación Listado: </Form.Label>
                        <Form.Control
                            type ="number"
                            size="sm"
                            min="1"
                            max="100"
                            value={itemsPerPage}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                setItemsPerPage(Math.max(1, Math.min(100, value)));
                                setCurrentPage(1);
                            }}
                            style={{ maxWidth: "60px", display: "inline-block" }}/>
                    </Col>
                </Row>
            </Container>

            {/* TABLA */}
            {mostrarListado && (
                <div className="table-container">
                    <Table striped bordered size="sm">
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
                            {paginatedGastos.length === 0 ? (
                                <tr>
                                    <td colSpan={17} className="text-center">
                                        No hay gastos para mostrar
                                    </td>
                                </tr>
                            ) : (
                                paginatedGastos.map((gasto) => (
                                    <tr key={gasto.id}>
                                        <td><Form.Check/></td>
                                        <td>{gasto.id}</td>
                                        <td>{gasto.fecha}</td>
                                        <td>{gasto.usuario}</td>
                                        <td>{gasto.obra}</td>
                                        <td>{gasto.descripcion}</td>
                                        <td>{gasto.tipo}</td>
                                        <td>{gasto.cantidad}</td>
                                        <td>{gasto.importeUnitario}</td>
                                        <td>{gasto.total}</td>
                                        <td>{gasto.validado ? "✔" : ""}</td>
                                        <td>{gasto.usuarioValida}</td>
                                        <td>{gasto.visa ? "✔" : ""}</td>
                                        <td>{gasto.pagado ? "✔" : ""}</td>
                                        <td>{gasto.usuarioPaga}</td>
                                        <td>{gasto.observaciones}</td>
                                        <td>Acciones</td>
                                    </tr>
                                ))
                            )}

                        </tbody>
                    </Table>
                </div>
            )}
            
        </div>
    );
};

export default GastosList;