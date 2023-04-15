const app = require("./app");
const { connectDatabase } = require("./config/database");

connectDatabase();

app.listen(process.env.port, () => {
  console.log(`server is running on ${process.env.port}`);
});
