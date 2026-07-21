require("dotenv").config();

const express = require("express");
const cors = require("cors");
const healthRouter = require("./routes/health");
const propertiesRouter = require("./routes/properties");
const requestLogger = require("./middleware/requestLogger");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api/health", healthRouter);
app.use("/api/properties", propertiesRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
