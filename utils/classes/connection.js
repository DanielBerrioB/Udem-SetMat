const {
  verifyCode,
  addTeam,
  retrieveCurrentTeams,
  deleteATeam
} = require("./sockets");

module.exports = class Connection {
  constructor() {
    this.socket;
    this.io;
  }

  /**
   * Initialize the socket instance in order to use it all over
   * life cycle
   */
  async initEvents() {
    let connection = this;
    let socket = connection.socket;
    let io = connection.io;

    socket.emit("main", { message: "Principal 23" });

    socket.on("joinRoom", async data => {
      let socketData = { code: data.split("|")[0], team: data.split("|")[1] };
      let res = await verifyCode(socketData.code);

      if (res) {
        let currentTeams = await retrieveCurrentTeams(data.split("|")[0]);
        currentTeams = currentTeams
          ? currentTeams.length > 0
            ? currentTeams
            : []
          : [];
        let team = {};
        let isRepeated = currentTeams.find(e => e.team === socketData.team);
        if (isRepeated) {
          team.message = "El equipo ya se encuentra registrado";
        } else if (currentTeams.teams.length < 6) {
          team = await addTeam(socketData.code, socketData.team);
          io.emit("response", team);
          if (team.status) {
            team.message = "Equipo añadido";
          } else {
            team.message = "Error intenta de nuevo";
          }
          currentTeams.teams.push({ team: socketData.team, score: 0 });
          io.emit("response", team);
          io.emit("getWebTeams", currentTeams);
        } else {
          team.message = "Ya hay mas de seis equipos en la sala";
          team.team = [];
          socket.emit("response", team);
        }
      } else {
        socket.emit("response", {
          message: "El código no es válido",
          stutus: false,
          team: []
        });
      }
    });

    socket.on("callTeams", async data => {
      retrieveCurrentTeams(data).then(result => {
        console.log("entra");
        socket.emit("getTeams", { Items: result.teams });
        socket.broadcast.emit("getTeams", { Items: result.teams });
      });
    });

    socket.on("onDisconnectTeam", async data => {
      deleteATeam(data).then(result =>
        socket.emit("onDisconnectTeamResponse", result)
      );
    });

    socket.on("disconnect", async data => {
      console.log("desconectado");
    });
  }
};
