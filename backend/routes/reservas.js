const express = require('express');
const router = express.Router();
const controller = require('../controllers/reservaController');
const verificarToken = require('../middlewares/verificarToken');

router.post('/', verificarToken, controller.crearReserva);
router.get('/:usuarioId', controller.obtenerReservasUsuario);
router.delete('/:id', verificarToken, controller.eliminarReserva);  // <-- agregar esta línea

module.exports = router;
