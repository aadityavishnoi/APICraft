const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const dynamicRoutes = require("./routes/dynamicRoutes");
dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Server Is Running!");
})
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use(dynamicRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Is Running On PORT: ${PORT}`);
});   
