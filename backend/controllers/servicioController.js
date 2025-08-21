const Servicio = require('../models/Servicio');

exports.obtenerServicios = async (req, res) => {
  const servicios = await Servicio.find();
  res.json(servicios);
};

exports.crearServicio = async (req, res) => {
  const { nombre, descripcion } = req.body;
  const nuevo = new Servicio({ nombre, descripcion });
  await nuevo.save();
  res.json({ mensaje: 'Servicio agregado' });
};

exports.eliminarServicio = async (req, res) => {
  try {
    const id = req.params.id;
    await Servicio.findByIdAndDelete(id);
    res.json({ mensaje: 'Servicio eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
