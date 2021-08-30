"use strict"

const express = require("express")
const router = express.Router()
const { json } = require("body-parser")
const articleModel = require("../models/Article")
const config = require("../../../../config/config")

router.use(json())

const writeToPublishedInArticlesDB = async (req, res, next) => {
	// console.log("----Write public article----")
	// req.body.article.authorId = mongoose.Types.ObjectId(req.body.article.authorId)
	const article = new articleModel(req.body.article)
	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	await mongoConnection
		.collection("publicArticles_collection") // получаем доступ к коллекции документов
		.insertOne(article)
		.then(
			(insertResult) => {
				// console.log("Ураа, Записали в бд публичную статью, поздравляю, дальше идет запись в юзера")
				res.locals.insertedId = insertResult.insertedId
				// console.log("Айдишник статьи: " + articleId)
				next()
			},
			(insertError) => {
				console.log("insert error: " + insertError)
				res.sendStatus(204)
			}
		)
}

router.post("/", writeToPublishedInArticlesDB, (req, res) => {
	// console.log("----Write public article id in to the user----")

	res.sendStatus(201)
	// const usersDb = config.dataBaseConnection.useDb("users_db")
	// const userId = mongoose.Types.ObjectId(req.body.article.authorId)

	// // console.log("Айдишник пришедшего юзера: " + req.body.article.authorId)

	// await usersDb
	// 	.collection("user_collection")
	// 	.updateOne({ _id: userId }, { $push: { "articles.public": { articleId: res.locals.insertedId } } })
	// 	.then(
	// 		(updateResult) => {
	// 			// console.log("Нашли пользователя и записали в енего статью")
	// 			res.sendStatus(201)
	// 		},
	// 		(updateError) => {
	// 			console.log("Update user draft array error: " + updateError)
	// 			res.sendStatus(204)
	// 		}
	// 	)
})

module.exports = router
