const app = require("./app");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
require("./config/dotenv.config");

const { emitCodes } = require("./utils/helpers");
const { verifyCode, addTeam } = require("./utils/sockets");

io.on("connection", async socket => {
  socket.emit("main", { message: "I ❤ la loma." });

  socket.on("joinRoom", async data => {
    //emitCodes(io);

    let res = await verifyCode(data.code);
    console.log(data, "ENTRA", res);
    if (res) {
      let team = await addTeam(data.code, data.team);
      if (team.status) {
        team.message = "Equipo añadido";
      } else {
        team.message = "Error intenta de nuevo";
      }
      io.emit("main", team);
    } else {
      io.emit("main", {
        message: "El código no es válido",
        stutus: false,
        team: []
      });
    }
  });
});

http.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = http;
