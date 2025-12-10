import express from "express";
import cors from "cors";

// Enrutadores
import almacenRouter from "./routes/almacenRoutes.mjs";
import facturasRouter from "./routes/FacturasRouter.mjs";
import contactoRouter from "./routes/contactoRoutes.mjs";
import edificioRouter from "./routes/edificioRoutes.mjs";
import empresaRouter from "./routes/empresaRoutes.mjs";
import estadoObraRouter from "./routes/estadoObraRoutes.mjs";
import tiposFacRouter from "./routes/tipoFacturableRoutes.mjs";
import tiposObRouter from "./routes/tipoObraRoutes.mjs";
import usuarioRouter from "./routes/usuarioRoutes.mjs";
import relacionObrasRouter from "./routes/relacionObrasRouter.mjs";
import obraRouter from "./routes/obraRoutes.mjs";
import rentabilidadRouter from "./routes/rentabilidadRoutes.mjs";
import ecoFacturaRouter from "./routes/ecoFacturaRoutes.mjs";
import ecoPedidoRouter from "./routes/ecoPedidoRoutes.mjs";
import gastoRouter from "./routes/gastoRouter.mjs";
import horasRouter from "./routes/horasRoutes.mjs";
import movimientosAlmacenRouter from "./routes/MovimientosAlmacenRoutes.mjs";
import responsablesRouter from "./routes/ResponsablesRouter.mjs";

const app = express();
const PORT = 3002;

// Middleware para CORS
app.use(cors());
// Middleware para parsear JSON
app.use(express.json());

// Configuramos los enrutadores
app.use("/api/almacen", almacenRouter);
app.use("/api/facturas", facturasRouter);
app.use("/api/contacto", contactoRouter);
app.use("/api/edificio", edificioRouter);
app.use("/api/empresa", empresaRouter);
app.use("/api/estado-obra", estadoObraRouter);
app.use("/api/tipo-facturable", tiposFacRouter);
app.use("/api/tipo-obra", tiposObRouter);
app.use("/api/usuario", usuarioRouter);
app.use("/api/relacion-obras", relacionObrasRouter);
app.use("/api/obra", obraRouter);
app.use("/api/rentabilidad", rentabilidadRouter);
app.use("/api/ecoPedido", ecoPedidoRouter);
app.use("/api/ecoFactura", ecoFacturaRouter);
app.use("/api/gastos", gastoRouter);
app.use("/api/horas", horasRouter);
app.use("/api/movimientos-almacen", movimientosAlmacenRouter);
app.use("/api/responsables", responsablesRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
