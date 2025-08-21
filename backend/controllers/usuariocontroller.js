const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'secreto';

// Registrar usuario
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar campos
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar si ya existe el email
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear y guardar usuario
    const usuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      rol
    });

    await usuario.save();
    res.status(200).json({ mensaje: 'Usuario registrado correctamente' });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Validar contraseña
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      secret,
      { expiresIn: '3h' }
    );

    res.status(200).json({ mensaje: 'Login exitoso', token });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};
