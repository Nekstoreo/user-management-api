import express from "express";
import { body, validationResult } from "express-validator";
import database from "../utils/requestsDatabase.js"; // Asegúrate de que la ruta sea correcta
import { auth } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * @route   POST /requests
 * @desc    Crear una nueva request
 */
router.post(
  "/",
  auth,
  [
    body("description").trim().notEmpty().withMessage("La descripción es obligatoria"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await logger.log("ERROR", "Validation failed in requests", { errors: errors.array() });
      return res.status(400).json({ 
        error: "Error de validación", 
        code: "VALIDATION_ERROR", 
        details: errors.array() 
      });
    }

    try {
      const { description } = req.body;
      const user_id = req.user.id; // ID del usuario autenticado
      const date = new Date().toISOString();

      const newRequest = {
        user_id,
        date,
        description,
      };

      const requestId = await database.addRequest(newRequest);
      await logger.log("INFO", "New request created", { requestId, user_id });

      res.status(201).json({
        message: "Request creada exitosamente",
        code: "REQUEST_SUCCESS",
        data: { requestId, user_id, date, description },
      });
    } catch (error) {
      await logger.log("ERROR", "Request creation failed", { error: error.message });
      res.status(500).json({
        error: "Error en el servidor",
        code: "SERVER_ERROR",
      });
    }
  }
);

/**
 * @route   GET /requests
 * @desc    Obtener todas las requests
 */
router.get("/", auth, async (req, res) => {
  try {
    const requests = await database.getAllRequests();
    res.json({ requests });
  } catch (error) {
    await logger.log("ERROR", "Failed to fetch requests", { error: error.message });
    res.status(500).json({
      error: "Error en el servidor",
      code: "SERVER_ERROR",
    });
  }
});

/**
 * @route   GET /requests/:id
 * @desc    Obtener una request por ID
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await database.getRequestById(requestId);

    if (!request) {
      return res.status(404).json({ 
        error: "Request no encontrada", 
        code: "REQUEST_NOT_FOUND" 
      });
    }

    res.json({ request });
  } catch (error) {
    await logger.log("ERROR", "Failed to fetch request", { error: error.message });
    res.status(500).json({
      error: "Error en el servidor",
      code: "SERVER_ERROR",
    });
  }
});

/**
 * @route   DELETE /requests/:id
 * @desc    Eliminar una request por ID
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const deleted = await database.deleteRequest(requestId);

    if (!deleted) {
      return res.status(404).json({ 
        error: "Request no encontrada", 
        code: "REQUEST_NOT_FOUND" 
      });
    }

    await logger.log("INFO", "Request deleted", { requestId });
    res.json({ message: "Request eliminada exitosamente", code: "REQUEST_DELETED" });
  } catch (error) {
    await logger.log("ERROR", "Failed to delete request", { error: error.message });
    res.status(500).json({
      error: "Error en el servidor",
      code: "SERVER_ERROR",
    });
  }
});

export default router;
