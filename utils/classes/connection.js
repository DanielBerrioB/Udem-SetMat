const {
  verifyCode,
  addTeam,
  retrieveCurrentTeams,
  deleteATeam
} = require("./sockets");

module.exports = class Connection {
  constructor() {
    this.socket;
  }

  /**
   * Initialize the socket instance in order to use it all over
   * life cycle
   */
  async initEvents() {
    let connection = this;
    let socket = connection.socket;

    socket.emit("main", { message: "Principal" });

    socket.on("joinRoom", async data => {
      let socketData = { code: data.split("|")[0], team: data.split("|")[1] };
      let res = await verifyCode(socketData.code);

      if (res) {
        let currentTeams = await retrieveCurrentTeams(data.split("|")[0]);
        let team = {};
        if (currentTeams.teams.length < 6) {
          team = await addTeam(socketData.code, socketData.team);
          if (team.status) {
            team.message = "Equipo añadido";
          } else {
            team.message = "Error intenta de nuevo";
          }
          socket.emit("response", team);
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
        socket.emit("getTeams", result.teams);
        socket.broadcast.emit("getTeams", { Items: result.teams });
      });
    });

    socket.on("onDisconnectTeam", async data => {
      deleteATeam(data).then(result =>
        socket.emit("onDisconnectTeamResponse", result)
      );
    });

    socket.on("disconnect", () => {
      console.log("desconectado");
    });
  }
};
