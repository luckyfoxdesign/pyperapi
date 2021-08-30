"use strict"

const user = "luckyfoxdesign_admin",
	password = "pmHydQ94"

module.exports = {
	mongoConnectionString: function getConnectionString(dbName) {
		return `mongodb://${user}:${password}@5.53.124.183:27020/${dbName}?authSource=admin`
	},
	mongoConnectionOptions: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	},
	mongoStoreConnectionOptions: {
		url: `mongodb://${user}:${password}@5.53.124.183:27020/sessions_db?authSource=admin`,
		collection: "sessions",
		ttl: 40,
		secret: "qwefihqrioghwi*ˆ&$#%$ˆ%&ˆ*(&)_rgjbj34b4_u4gbiu54gnksjrnegkjuwhrgu933",
	},
	dataBaseConnection: "",
}
