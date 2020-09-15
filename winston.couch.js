const Transport = require("winston-transport");
const nano = require("nano");

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class CouchTransport extends Transport {
  constructor(opts) {
    super(opts);

    if (!opts.url && !(opts.username && opts.password && opts.host))
      return console.log("Insufficient database credentials provided");

    this.goOn = false;

    // Instantiate using url OR username/password/host
    this.nano = nano(
      opts.url ||
        "https://" + opts.username + ":" + opts.password + "@" + opts.host
    );

    this.dbName = opts.db || "winston-logs";
    this.db = this.nano.use(opts.db);
    this.uuids = [];

    this.app = opts.app || opts.application || "default";
    this.version = opts.v || opts.version || "0.0.0";
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    if (!this.goOn) {
      await this.nano.db.create(this.dbName).catch((err) => {});
      this.goOn = true;
    }

    if (this.uuids.length === 0) {
      const { uuids } = await this.nano.uuids(100);
      this.uuids = [...uuids];
    }

    var meta = { ...info };

    info.timestamp = new Date();

    this.db.insert(
      {
        _id: `${this.app}:${this.uuids.shift()}`,
        application: this.app,
        version: this.version,
        resource: "log",
        time: info.timestamp,
        params: meta,
      },
      function (err, data) {
        if (err) console.log("FEL: " + err + "");
        callback();
      }
    );
  }
};
