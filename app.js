const express = require("express");
const { getMonCashToken } = require("./moncash-auth");
const moncashRouter = require("./moncash-payment")


const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});


app.get("/auth/moncash", async (req, res) => {
  try {
    const tokenData = await getMonCashToken();
    res.json(tokenData);
  } catch (err) {
    res.status(500).json({ error: "Authentication failed" });
  }
});

app.use("/moncash", moncashRouter);

// Error handler (optional but helpful)
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err.stack);
  res.status(500).send("Something went wrong!");
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
