const express = require('express');
const cors = require("cors");
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./api/models');
const v1 = require('./api/routes/v1');

const app = express();
app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api', v1);
app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3005;

(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(PORT, () => console.log('Server running on', PORT));
})();