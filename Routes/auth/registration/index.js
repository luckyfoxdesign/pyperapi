"use strict"

const express = require("express")
const session = require("express-session")
const router = express.Router()
const { json } = require("body-parser")
const MongoStore = require("connect-mongo")
const { v4: uuidv4 } = require("uuid")
const { env } = require("process")
const argon2 = require("argon2")
const usermodel = require("./models/User")
const config = require("../../../config/config")
const par = require("../../../config/env")

const SESSECRET = env.SESSECRET || par.SESSECRET

router.use(json())

const mongoSessionStore = MongoStore.create(config.mongoStoreConnectionOptions)
router.use(
	session({
		genid: function (req) {
			return uuidv4()
		},
		secret: `${SESSECRET}`,
		cookie: {
			maxAge: 86400000 / 2, // 12 hours
			secure: false,
			httpOnly: false,
			sameSite: false,
			path: "/",
		},
		store: mongoSessionStore,
		resave: false,
		saveUninitialized: false,
		unset: "destroy",
	})
)

// Поиск юзера в бд
const searchUserInUsersDB = async (req, res, next) => {
	const mongoConnection =
		config.dataBaseConnection.name === "users_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("users_db")

	await mongoConnection
		.collection("user_collection")
		.findOne({ email: req.body.email })
		.then(
			(findOneResult) => {
				if (findOneResult === null) {
					next()
				} else {
					res.sendStatus(204)
				}
			},
			(findOneError) => {
				console.log("Ошибка поиска юзера")
				console.error(findOneError)
				res.sendStatus(204)
			}
		)
}

//хеширование пароля
const hashPassword = async (req, res, next) => {
	await argon2.hash(req.body.password).then(
		(hashingResult) => {
			let reqUser = {
				email: "",
				password: "",
				salt: "",
			}

			reqUser.email = req.body.email
			reqUser.password = hashingResult.substring(29)
			reqUser.salt = hashingResult.slice(0, -66)
			res.locals.reqUser = reqUser

			next()
		},
		(hashingError) => {
			console.log("Ошибка хеширования пароля")
			console.error(hashingError)
			res.sendStatus(204)
		}
	)
}

// вставка данных пользователя в бд и отправка на клиент
router.post("/", [searchUserInUsersDB, hashPassword], async (req, res, next) => {
	const newUser = new usermodel(res.locals.reqUser)

	const mongoConnection =
		config.dataBaseConnection.name === "users_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("users_db")

	console.log(req.sessionID)

	await mongoConnection
		.collection("user_collection")
		.insertOne(newUser)
		.then(
			(insertOneResult) => {
				let newUser = {
					_id: insertOneResult.ops[0]._id,
					email: insertOneResult.ops[0].email,
					nickname: insertOneResult.ops[0].nickname,
					joinDate: insertOneResult.ops[0].joinDate,
					role: insertOneResult.ops[0].role,
				}
				req.session.data = newUser
				res.status(200).json({ data: newUser })
			},
			(insertOneError) => {
				console.log("Ошибка создания пользователя")
				console.error(insertOneError)
				res.sendStatus(204)
			}
		)
})

module.exports = router
