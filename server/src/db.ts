import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Load CommonJS Sequelize models via require
const db = require("../models/index.js");

export default db;
