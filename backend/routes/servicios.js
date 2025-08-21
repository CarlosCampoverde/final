const express = require('express');
const router = express.Router();
const controller = require('../controllers/servicioController');
const verificarToken = require('../middlewares/verificarToken');

router.get('/', controller.obtenerServicios);
router.post('/', verificarToken, controller.crearServicio);
router.delete('/:id', verificarToken, controller.eliminarServicio);  

module.exports = router;
