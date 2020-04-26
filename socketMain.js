const mongoose = require("mongoose");
mongoose.connect(
  "mongodb://badri:12td0426@ds237357.mlab.com:37357/heroku_xlcgbdkk",
  { useNewUrlParser: true }
);
const Machine = require("./models/Machine");

function socketMain(io, socket) {
  let macA;
  console.log("A socket connectd!", socket.id);

  socket.on("clientAuth", (key) => {
    if (key === "5t78yuhgirekjaht32i3") {
      // valid nodeClient
      socket.join("clients");
    } else if (key === "uihjt3refvdsadf") {
      // valid ui client has joined
      socket.join("ui");
      console.log("A react client has joined!");
      Machine.find({}, (err, docs) => {
        docs.forEach((aMachine) => {
          // on load, assume that all machines are offline
          aMachine.isActive = false;
          io.to("ui").emit("data", aMachine);
        });
      });
    } else {
      // an invalid client has joined. Goodbye
      socket.disconnect(true);
    }
  });

  // a machine has connected, check to see if it's new.
  // if it is, add it!
  socket.on("initPerfData", async (data) => {
    // update our socket connect function scoped variable
    macA = data.macA;
    // now go check mongo!
    const mongooseResponse = await checkAndAdd(data);
    console.log(mongooseResponse);
  });

  socket.on("perfData", (data) => {
    io.to("ui").emit("data", data);
  });
}

function checkAndAdd(data) {
  // because we are doing db stuff, js wont wait for the db
  // so we need to make this a promise
  return new Promise((resolve, reject) => {
    Machine.findOne({ macA: data.macA }, (err, doc) => {
      if (err) {
        throw err;
        reject(err);
      } else if (doc === null) {
        // the record is not in the db, so add it!
        let newMachine = new Machine(data);
        newMachine.save(); //actually save it
        resolve("added");
      } else {
        // it is in the db. just resolve
        resolve("found");
      }
    });
  });
}

module.exports = socketMain;
