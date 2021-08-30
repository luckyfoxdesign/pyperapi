"use strict"

const express = require("express")
const router = express.Router()

const { json } = require("body-parser")
const argon2 = require("argon2")
const config = require("../../../../config/config")
const mongoose = require("mongoose")

router.use(json())

const checkUsersDBforUser = async (req, res, next) => {
	// console.log("Этап 1 - поиск юзера")
	const mongoConnection =
		config.dataBaseConnection.name === "users_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("users_db")

	const userId = mongoose.Types.ObjectId(req.body.id)
	res.locals.userId = userId

	await mongoConnection
		.collection("user_collection")
		.findOne({ email: req.body.email, _id: userId })
		.then(
			(findOneRuesult) => {
				if (findOneRuesult === null) {
					res.sendStatus(204)
				} else {
					res.locals.userFromDB = findOneRuesult
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
	// console.log("Этап 2 - проверка пароля")

	const passwordFromDB = res.locals.userFromDB.salt + res.locals.userFromDB.password
	const passrodFromUser = req.body.oldPassword
	try {
		if (await argon2.verify(passwordFromDB, passrodFromUser)) {
			next()
		} else {
			res.sendStatus(204)
		}
	} catch (checkPasswordError) {
		res.sendStatus(204)
		console.log(checkPasswordError)
	}
}

const hashPassword = async (req, res, next) => {
	// console.log("Этап 3 - хеширование")
	await argon2.hash(req.body.newPassword).then(
		(hashingResult) => {
			let reqUser = {
				password: "",
				salt: "",
			}

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

router.patch("/", [checkUsersDBforUser, checkUserPassword, hashPassword], async (req, res) => {
	// console.log("Этап 4 - обновление")
	const mongoConnection =
		config.dataBaseConnection.name === "users_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("users_db")

	await mongoConnection
		.collection("user_collection")
		.updateOne(
			{ _id: res.locals.userId },
			{ $set: { salt: res.locals.reqUser.salt, password: res.locals.reqUser.password } }
		)
		.then(
			(updatePasswordRuesult) => {
				if (updatePasswordRuesult.modifiedCount === 1) {
					res.sendStatus(200)
				} else {
					res.sendStatus(204)
				}
			},
			(updatePasswordError) => {
				// console.log("Ошибка смены пароля")
				console.error(updatePasswordError)
				res.sendStatus(204)
			}
		)
})

module.exports = router
