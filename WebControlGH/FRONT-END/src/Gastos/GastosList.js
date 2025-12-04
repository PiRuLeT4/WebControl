import React, {useEffect, useState} from "react";
import{
    Table,
    Button,
    Container,
    Col,
    Form,
    Row
} from "react-bootstrap";
import axios from "axios";

function GastosList(){
    const[gastos, setGastos] = useState([]);

    
    return(
        <div className="gastos-obras">
            <Container>
                <Row>
                    <Col nd={8} className="Filters">
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
            <div className="table-container">
                <thread>
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
                </thread>
            </div>
        </div>
    )
}
//Estados

//Datos derivados

//Fetch


//Utilidades


//Filtrado


//Paginacion

//Render

export default GastosList;