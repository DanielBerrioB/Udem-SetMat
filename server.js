require("./config/dotenv.config");
const app = require("./app");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const socketConnection = require("./utils/classes/connection");

//Sockets connection
io.on("connection", async socket => {
  let socketInstance = new socketConnection();
  socketInstance.socket = socket;
  socketInstance.initEvents();
});

http.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = http;
