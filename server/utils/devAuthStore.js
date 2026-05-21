const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const storeDir = path.join(__dirname, '..', '.dev-data');
const storePath = path.join(storeDir, 'users.json');

const ensureStore = () => {
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ users: [] }, null, 2));
  }
};

const readStore = () => {
  ensureStore();
  const raw = fs.readFileSync(storePath, 'utf8');
  return JSON.parse(raw || '{"users":[]}');
};

const writeStore = (data) => {
  ensureStore();
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone || '',
  address: user.address || ''
});

const defaultAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&bold=true`;

const createUser = async ({ name, email, password, role }) => {
  const store = readStore();
  const normalizedEmail = String(email).toLowerCase();

  if (store.users.some((user) => user.email === normalizedEmail)) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = {
    _id: uuidv4(),
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: role === 'admin' ? 'admin' : 'user',
    avatar: defaultAvatar(name),
    phone: '',
    address: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.users.push(user);
  writeStore(store);
  return publicUser(user);
};

const findUserByEmail = async (email) => {
  const store = readStore();
  const normalizedEmail = String(email).toLowerCase();
  const user = store.users.find((item) => item.email === normalizedEmail);
  return user || null;
};

const findUserById = async (id) => {
  const store = readStore();
  const user = store.users.find((item) => item._id === id);
  return user || null;
};

const verifyPassword = async (user, password) => bcrypt.compare(password, user.password);

const updateUser = async (id, updates) => {
  const store = readStore();
  const index = store.users.findIndex((item) => item._id === id);
  if (index === -1) return null;

  store.users[index] = {
    ...store.users[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeStore(store);
  return publicUser(store.users[index]);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  updateUser,
  publicUser
};
