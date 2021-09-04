"use strict"

const express = require("express")
const session = require("express-session")
const MongoDBStore = require("connect-mongodb-session")(session)
const app = express()
const mongoose = require("mongoose")
const config = require("./config/config")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const { env } = require("process")

const login = require("./Routes/auth/login/index")
const register = require("./Routes/auth/registration/index")

// app.use(json())
// app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const store = new MongoDBStore({
	uri: config.mongoConnectionString("sessions_db"),
	databaseName: "sessions_db",
	collection: "sessions",
})

store.on("error", function (error) {
	console.log(error)
})

app.set("trust proxy", 1)
app.use(
	require("express-session")({
		genid: function (req) {
			return uuidv4()
		},
		secret: `${env.SESSECRET}`,
		cookie: {
			maxAge: 60 * 60, // 1 hour
			secure: true,
			path: "/*",
		},
		store: store,
		resave: false,
		saveUninitialized: false,
		secure: true,
	})
)

// app.all("/auth/*", (req, res) => {
// 	if (isUserAdmin(req)) {
// 		res.json({ s: 1 })
// 	} else res.json({ s: 0 })
// })

app.use("/api/auth/login", [cors(), login])
app.use("/api/auth/registration", [cors(), register])

app.listen(env.NODEPORT, async (err) => {
	if (err) console.log("error", err)
	else {
		config.dataBaseConnection = await mongoose.createConnection(
			config.mongoConnectionString("articles_db"),
			config.mongoConnectionOptions
		)
		// config.dataBaseConnection.on("disconnected", (disconnectedError) => {
		// 	console.log(disconnectedError)
		// })
	}
	console.log(`backend started on env port: ${env.NODEPORT}`)
})

const isUserAdmin = (req) => {
	return req.session.data.permissions == "admin" ? true : false
}
