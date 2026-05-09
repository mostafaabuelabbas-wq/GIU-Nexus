const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Swagger API docs
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/profile", require("./routes/profileRoutes"));
app.use("/api/v1/jobs", require("./routes/jobRoutes"));
app.use("/api/v1/applications", require("./routes/applicationRoutes"));

app.get("/", (req, res) => {
    res.send("API is running...");
});

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = app;
