import React, { useState } from "react"; // Importa React y el hook useState
import "../css/Profitability.css"; // Importa los estilos específicos de Profitability

// Componente ProfitabilityTable
function ProfitabilityTable() {
  // Datos simulados de rentabilidad
  const data = [
    {
      cod: "0009",
      descripcion: "Gastos Generales",
      tipo: "INST+PPM",
      fComienzo: "09-08-2016",
      fFinal: "21-08-2019",
      importe: 0,
      hPrev: 0,
      hTotal: 90,
      gReal: 71673.72,
      rent: -71673.72,
      pRent: 0.0,
    },
    {
      cod: "SAT719",
      descripcion: "4101467811 FRANCE TELECOM SEDE ULISES",
      tipo: "SAT TR",
      fComienzo: "Sin Horas",
      fFinal: "Sin Horas",
      importe: 0,
      hPrev: 0,
      hTotal: 0,
      gReal: 0.0,
      rent: 0.0,
      pRent: 0.0,
    },
    {
      cod: "2351RO",
      descripcion: "Sede Nacional Testigos Jehova WATCH TOWER",
      tipo: "PPM",
      fComienzo: "29-01-2018",
      fFinal: "29-10-2020",
      importe: 25295,
      hPrev: 670,
      hTotal: 768.5,
      gReal: 16649.67,
      rent: 8745.33,
      pRent: 34.44,
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Función para manejar la búsqueda
  const handleSearch = () => {
    const filtered = data.filter(
      (item) =>
        item.cod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // Función para manejar la selección de todos los elementos
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      const allSelected = filteredData.map((item) => item.cod);
      setSelectedItems(allSelected);
    } else {
      setSelectedItems([]);
    }
  };

  // Función para manejar la selección de un elemento
  const handleSelectItem = (cod) => {
    if (selectedItems.includes(cod)) {
      setSelectedItems(selectedItems.filter((item) => item !== cod));
    } else {
      setSelectedItems([...selectedItems, cod]);
    }
  };

  // Función para manejar el clic en "Recalcular Rentabilidad Obras"
  const handleRecalculateClick = () => {
    if (selectedItems.length > 0) {
      setShowConfirmation(true);
    } else {
      setShowAlert(true);
    }
  };

  // Función para confirmar la acción de recalcular rentabilidad
  const handleConfirm = () => {
    setShowConfirmation(false);
    alert("Recalculando rentabilidad de las obras seleccionadas");
  };

  // Función para cancelar la acción de recalcular rentabilidad
  const handleCancel = () => {
    setShowConfirmation(false);
  };

  // Función para cerrar la alerta
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <div className="profitability-table-container">
      <h2>Listado de rentabilidades</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Busque por nombre, descripción o código"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar</button>
      </div>
      <div className="content">
        <div className="table-and-totals">
          <table className="profitability-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Cod.</th>
                <th>Descripcion</th>
                <th>Tipo</th>
                <th>F. Comienzo</th>
                <th>F. Final</th>
                <th>Importe</th>
                <th>H. Prev</th>
                <th>H. Total</th>
                <th>G. Real</th>
                <th>Rent.</th>
                <th>%Rent.</th>
                <th>Accion</th> {/* Añadido th para Acción */}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.cod)}
                      onChange={() => handleSelectItem(item.cod)}
                    />
                  </td>
                  <td>{item.cod}</td>
                  <td>{item.descripcion}</td>
                  <td>{item.tipo}</td>
                  <td>{item.fComienzo}</td>
                  <td>{item.fFinal}</td>
                  <td>{item.importe}</td>
                  <td>{item.hPrev}</td>
                  <td>{item.hTotal}</td>
                  <td>{item.gReal}</td>
                  <td>{item.rent}</td>
                  <td>{item.pRent}</td>
                  <td>
                    <button>Detalles</button>
                  </td>{" "}
                  {/* Añadido botón de detalle */}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals-and-actions">
            <div className="actions">
              <div className="action-button">
                <button onClick={handleRecalculateClick}>
                  Recalcular Rentabilidad Obras
                </button>
                <p>Recalcula la rentabilidad de las obras específicas.</p>
              </div>
              <div className="action-button">
                <button>Recalcular Todo</button>
                <p>Recalcula todas las rentabilidades de las obras.</p>
              </div>
              <div className="action-button">
                <button>Imprimir Rentabilidades</button>
                <p>Imprime el listado completo de rentabilidades.</p>
              </div>
            </div>
            <div className="totals">
              <p>Importe Total: 25,295.00</p>
              <p>Horas Previstas: 670.0</p>
              <p>Horas Reales: 858.50</p>
              <p>Gasto Real: 88,323.39</p>
              <p>Rentabilidad: -63,028.39</p>
              <p>%Rentabilidad: -249.17</p>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="confirmation-modal">
          <p>
            ¿Estás seguro de que deseas recalcular la rentabilidad de las obras
            seleccionadas?
          </p>
          <button onClick={handleConfirm}>Estas seguro</button>
          <button onClick={handleCancel}>Cancelar</button>
        </div>
      )}

      {showAlert && (
        <div className="alert-modal">
          <p>No hay ninguna obra seleccionada</p>
          <button onClick={handleCloseAlert}>Cerrar</button>
        </div>
      )}
    </div>
  );
}

export default ProfitabilityTable; // Exporta el componente ProfitabilityTable como predeterminado
