"use strict"

const localEnv = require("./env")
const { env } = require("process")

const SESSECRET = env.SESSECRET || localEnv.SESSECRET
const MDBPASSWD = env.MDBPASSWD || localEnv.MDBPASSWD
const MDBUSER = env.MDBUSER || localEnv.MDBUSER
const ADDRESS = env.ADDRESS || localEnv.ADDRESS

module.exports = {
	mongoConnectionString: function getConnectionString(dbName) {
		return `mongodb://${MDBUSER}:${MDBPASSWD}@${ADDRESS}/${dbName}?authSource=admin`
	},
	mongoConnectionOptions: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	},
	mongoStoreConnectionOptions: {
		mongoUrl: `mongodb://${MDBUSER}:${MDBPASSWD}@${ADDRESS}/sessions_db?authSource=admin`,
		collectionName: "sessions",
		ttl: 40,
		secret: `${SESSECRET}`,
	},
	dataBaseConnection: "",
	mongoStore: "",
}
