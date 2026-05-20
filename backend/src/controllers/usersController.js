const {
  findAllUsers,
  findUserById,
} = require('../database');

const listUsers = async (req, res) => {
  const users = await findAllUsers(req.query);
  res.json(users);
};

const getUser = async (req, res) => {
  const user = await findUserById(Number(req.params.id));

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  return res.json(user);
};

module.exports = {
  listUsers,
  getUser,
};
