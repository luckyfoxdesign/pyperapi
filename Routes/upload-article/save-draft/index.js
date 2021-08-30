"use strict"

const express = require("express")
const router = express.Router()
const { json } = require("body-parser")
const articleModel = require("../models/Article")
const config = require("../../../../config/config")

router.use(json())

const writeToDraftsInArticlesDB = async (req, res, next) => {
	// console.log("----Write draft article----")

	const article = new articleModel(req.body.article)

	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	await mongoConnection
		.collection("draftArticles_collection") // получаем доступ к коллекции документов
		.insertOne(article)
		.then(
			(insertResult) => {
				// console.log("Ураа, Записали в бд черновую статью, поздравляю, дальше идет запись в юзера")

				// res.locals.insertedId = insertResult.insertedId
				// console.log("Айдишник статьи: " + res.locals.insertedId)
				next()
			},
			(insertError) => {
				console.log("insert error: " + insertError)
				res.status(204).send(JSON.stringify({ msg: "insert error" }))
			}
		)
}

router.post("/", writeToDraftsInArticlesDB, (req, res) => {
	// console.log("----Write draft article id in to the user----")
	res.sendStatus(201)
	// const usersDb = config.dataBaseConnection.useDb("users_db")
	// const userId = mongoose.Types.ObjectId(req.body.article.authorId)

	// console.log("Айдишник пришедшего юзера: " + req.body.article.authorId)

	// await usersDb
	// 	.collection("user_collection")
	// 	.updateOne({ _id: userId }, { $push: { "articles.draft": { articleId: res.locals.insertedId } } })
	// 	.then(
	// 		(updateResult) => {
	// 			console.log("Нашли пользователя и записали в енего статью")
	// 			res.sendStatus(201)
	// 		},
	// 		(updateError) => {
	// 			console.log("Update user draft array error: " + updateError)
	// 			res.status(204).send(JSON.stringify({ msg: "Update user draft array error" }))
	// 		}
	// 	)
})

module.exports = router
