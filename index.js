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

// const corsOptions = {
// 	origin: "http://80.249.144.228",
// 	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
// 	preflightContinue: false,
// 	optionsSuccessStatus: 204,
// }

// app.use(cors(corsOptions))
// app.use(
// 	helmet.contentSecurityPolicy({
// 		useDefaults: false,
// 		directives: {
// 			defaultSrc: ["'self'", "bs.devcodebox.com"],
// 			scriptSrc: ["'self'", "bs.devcodebox.com"],
// 			objectSrc: ["'none'"],
// 			upgradeInsecureRequests: [],
// 		},
// 	})
// )

// app.use(json())
// app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use("/api/auth/login", [cors(), login])
app.use("/api/auth/registration", [cors(), register])

const store = new MongoDBStore({
	uri: config.mongoConnectionString("sessions_db"),
	databaseName: "sessions_db",
	collection: "sessions",
})

store.on("error", function (error) {
	console.log(error)
})

app.use(
	require("express-session")({
		genid: function (req) {
			return uuidv4()
		},
		secret: `${env.SESSECRET}`,
		cookie: {
			maxAge: 60 * 60, // 1 hour
			secure: true,
		},
		store: store,
		// Boilerplate options, see:
		// * https://www.npmjs.com/package/express-session#resave
		// * https://www.npmjs.com/package/express-session#saveuninitialized
		resave: false,
		saveUninitialized: false,
	})
)

app.get("/", cors(), function (req, res) {
	req.session.data = { name: "maks" }
	console.log(req.session)
	console.log(req.session.data)
	res.send("Hello " + JSON.stringify(req.session.data))
})

app.get("/api", cors(), function (req, res) {
	console.log("get /api")
	res.send(JSON.stringify({ msg: "api route says hello" }))
})

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
