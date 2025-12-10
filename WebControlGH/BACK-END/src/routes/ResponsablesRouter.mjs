import { Router } from "express";
import { ResponsablesController } from "../controllers/ResponsablesController.mjs";
import { errorHandler } from "../middlewares/ErrorHandler.mjs";

export const responsablesRouter = Router();

responsablesRouter.get(
  "/subordinados/:codigoResponsable",
  ResponsablesController.getSubordinados
);

responsablesRouter.use(errorHandler);

export default responsablesRouter;
