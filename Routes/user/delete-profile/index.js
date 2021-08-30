"use strict"

const express = require("express")
const router = express.Router()

const { json } = require("body-parser")
const argon2 = require("argon2")
const config = require("../../../../config/config")
const mongoose = require("mongoose")

router.use(json())

const checkUsersDBforUser = async (req, res, next) => {
	console.log("поиск в бд")

	const userId = mongoose.Types.ObjectId(req.body.id)

	const mongoConnection =
		config.dataBaseConnection.name === "users_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("users_db")

	await mongoConnection
		.collection("user_collection")
		.findOne({ _id: userId, email: req.body.email })
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
	console.log("проверка пароля")

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

router.post("/", [checkUsersDBforUser, checkUserPassword], async (req, res) => {
	console.log("Удаление")
	const mongoConnection =
		config.dataBaseConnection.name === "users_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("users_db")

	await mongoConnection
		.collection("user_collection")
		.deleteOne({ _id: res.locals.user._id, email: res.locals.user.email })
		.then(
			(deleteRuesult) => {
				res.sendStatus(200)
			},
			(deleteError) => {
				console.log("Ошибка удаления юзера")
				console.error(deleteError)
				res.sendStatus(204)
			}
		)
})

module.exports = router
