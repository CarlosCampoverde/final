const Reserva = require('../models/Reserva');
const jwt = require('jsonwebtoken');

exports.crearReserva = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extrae solo el token
    if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const usuarioId = payload.id;

    const { servicioId, fecha, hora } = req.body;
    const reserva = new Reserva({ usuarioId, servicioId, fecha, hora });
    await reserva.save();

    res.json({ mensaje: 'Reserva hecha' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.obtenerReservasUsuario = async (req, res) => {
  try {
    const reservas = await Reserva.find({ usuarioId: req.params.usuarioId }).populate('servicioId');
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.eliminarReserva = async (req, res) => {
  try {
    const id = req.params.id;
    await Reserva.findByIdAndDelete(id);
    res.json({ mensaje: 'Reserva eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
