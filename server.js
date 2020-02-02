const app = require("./app");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
require("./config/dotenv.config");

io.on("connection", socket => {
  socket.emit("dummy", " I ❤ la loma");
  socket.on("clickme", data => {
    console.log(data);
    io.emit("dummy", data);
  });
});

http.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = http;
