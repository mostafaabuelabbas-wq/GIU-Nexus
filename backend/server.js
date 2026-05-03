const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
// app.use("/api/v1/profile",      require("./routes/profileRoutes"));
app.use("/api/v1/jobs", require("./routes/jobRoutes"));
// app.use("/api/v1/applications", require("./routes/applicationRoutes"));

// Test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Error handler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});