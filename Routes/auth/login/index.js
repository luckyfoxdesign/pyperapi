"use strict"

const express = require("express")
const router = express.Router()

const { json } = require("body-parser")
const argon2 = require("argon2")
const config = require("../../../../config/config")

router.use(json())

const checkUsersDBforUser = async (req, res, next) => {
	// console.log("Этап 1")
	const mongoConnection =
		config.dataBaseConnection.name === "users_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("users_db")

	await mongoConnection
		.collection("user_collection")
		.findOne({ email: req.body.email })
		.then(
			(findOneRuesult) => {
				if (findOneRuesult === null) {
					res.sendStatus(204)
				} else {
					res.locals.user = findOneRuesult
					next()
				}
			},
			(findOneError) => {
				console.log("Ошибка поиска юзера")
				console.error(findOneError)
				res.sendStatus(204)
			}
		)
}

const checkUserPassword = async (req, res, next) => {
	// console.log("Этап 2")

	const password = res.locals.user.salt + res.locals.user.password
	try {
		if (await argon2.verify(password, req.body.password)) {
			next()
		} else {
			res.sendStatus(204)
		}
	} catch (checkPasswordError) {
		res.sendStatus(204)
		console.log(checkPasswordError)
	}
}

router.post("/", [checkUsersDBforUser, checkUserPassword], (req, res) => {
	// console.log("Этап 3")

	// здесь будет обработка обьекта из бд и отправка его на фронтовое бекенд приложение
	let existedUser = {
		_id: res.locals.user._id,
		email: res.locals.user.email,
		nickname: res.locals.user.nickname,
		joinDate: res.locals.user.joinDate,
		role: res.locals.user.role,
	}
	// console.log(existedUser)

	res.status(200).json({ data: existedUser })
})

module.exports = router
