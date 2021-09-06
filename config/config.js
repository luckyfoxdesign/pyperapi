"use strict"

const { env } = require("process")

const USER = env.MDBUSER,
	PASSWD = env.MDBPASSWD,
	ADDRESS = env.ADDRESS,
	SESSECRET = env.SESECRET

module.exports = {
	mongoConnectionString: function getConnectionString(dbName) {
		return `mongodb://${USER}:${PASSWD}@${ADDRESS}/${dbName}?authSource=admin`
	},
	mongoConnectionOptions: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	},
	mongoStoreConnectionOptions: {
		mongoUrl: `mongodb://${USER}:${PASSWD}@${ADDRESS}/sessions_db?authSource=admin`,
		collectionName: "sessions",
		ttl: 40,
		secret: `${SESSECRET}`,
	},
	dataBaseConnection: "",
}
