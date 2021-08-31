"use strict"

const { env } = require("process")

module.exports = {
	mongoConnectionString: function getConnectionString(dbName) {
		return `mongodb://${env.MDBUSER}:${env.MDBPASSWD}@${env.ADDRESS}/${dbName}?authSource=admin`
	},
	mongoConnectionOptions: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	},
	mongoStoreConnectionOptions: {
		url: `mongodb://${env.MDBUSER}:${env.MDBPASSWD}@${env.ADDRESS}/sessions_db?authSource=admin`,
		collection: "sessions",
		ttl: 40,
		secret: `${env.SESSECRET}`,
	},
	dataBaseConnection: "",
}
