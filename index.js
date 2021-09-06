"use strict"

const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const app = express()
const mongoose = require("mongoose")
const config = require("./config/config")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const { env } = require("process")

const login = require("./Routes/auth/login/index")
const register = require("./Routes/auth/registration/index")

const SESSECRET = env.SESECRET
const NODEPORT = env.NODEPORT

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.set("trust proxy", 1)
app.use(
	session({
		genid: function (req) {
			return uuidv4()
		},
		secret: `${SESSECRET}`,
		cookie: {
			maxAge: 86400000 / 2, // 12 hours
			secure: true,
			httpOnly: false,
			sameSite: true,
			path: "/",
		},
		store: MongoStore.create(config.mongoStoreConnectionOptions),
		resave: false,
		saveUninitialized: false,
	})
)

app.use("/api/auth/login", [cors(), login])
app.use("/api/auth/registration", [cors(), register])

app.get("/rg", cors(), (req, res) => {
	const dt = (req.session.data = { username: "maks_test", role: "usr" })
	req.session.save()
	console.log(req.sessionID)
	console.log(req.session)
	res.json(dt)
})

app.get("/do", cors(), (req, res) => {
	console.log(req.sessionID)
	console.log(req.session)
	if (req.session.data) {
		console.log("do")
		res.json({ r: "do success" })
	} else {
		// const db = config.dataBaseConnection.useDb("sessions_db")
		// console.log(req.sessionID)
		// console.log(req.session.id)
		// let r
		// await db
		// 	.collection("sessions")
		// 	.findOne({ session: req.sessionID })
		// 	.then((res) => {
		// 		r = res
		// 		console.log(res)
		// 	})
		res.json({ r: "do error" })
	}
})

app.get("/go", cors(), (req, res) => {
	req.session.destroy()
	res.json({ r: "session destroyed" })
})

app.listen(NODEPORT, async (err) => {
	if (err) console.log("error", err)
	else {
		config.dataBaseConnection = await mongoose.createConnection(
			config.mongoConnectionString("articles_db"),
			config.mongoConnectionOptions
		)
	}
	console.log(`backend started on env port: ${NODEPORT}`)
})
