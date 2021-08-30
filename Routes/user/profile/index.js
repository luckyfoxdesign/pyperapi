"use strict"

const express = require("express")
const router = express.Router()
const { json } = require("body-parser")
const mongoose = require("mongoose")
const config = require("../../../config/config")

router.use(json())

router.use("/", async (req, res) => {
	// console.log("----Write public article id in to the user----")

	const mongoConnection =
		config.dataBaseConnection.name === "users_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("users_db")

	const userId = mongoose.Types.ObjectId(req.path.substring(1))

	// console.log("Айдишник пришедшего юзера: " + req.body.article.authorId)

	await mongoConnection
		.collection("user_collection")
		.findOne({ _id: userId })
		.then(
			(findResult) => {
				// console.log("Нашли пользователя и записали в енего статью")
				// console.log(findResult)
				const userData = {
					name: findResult.name,
					email: findResult.email,
					joinDate: findResult.joinDate,
				}
				res.status(200).json(userData)
			},
			(findError) => {
				console.log("Update user draft array error: " + findError)
				res.sendStatus(204)
			}
		)
})

module.exports = router
