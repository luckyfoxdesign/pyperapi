"use strict"

const express = require("express")
const router = express.Router()
const { json } = require("body-parser")
const mongoose = require("mongoose")
const articleModel = require("../models/Article")
const config = require("../../../../config/config")

// let articleNewId = ""

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
				// res.locals.articleNewId = insertResult.insertedId
				// console.log("Айдишник статьи: " + articleId)
				// articleOldId = req.body.article.articleOldId
				// console.log("Айдишник черновика на сервере: " + articleOldId)
				next()
			},
			(insertError) => {
				console.log("insert error: " + insertError)
				res.sendStatus(204)
			}
		)
}

const removeFromDraftsInArticlesDB = async (req, res, next) => {
	// console.log("----Write public article----")
	// req.body.article.authorId = mongoose.Types.ObjectId(req.body.article.authorId)
	const oldArticleId = mongoose.Types.ObjectId(req.body.article.articleOldId)

	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	await mongoConnection
		.collection("draftArticles_collection") // получаем доступ к коллекции документов
		.remove({ _id: oldArticleId }, { justOne: true })
		.then(
			(removeResult) => {
				// console.log("Удаление статьи из драфта чувака")
				// console.log(removeResult.result)
				next()
			},
			(removeError) => {
				console.log("insert error: " + removeError)
				res.sendStatus(204)
			}
		)
}

// const writeToPublishedInUser = async (req, res, next) => {
// 	// console.log("----Write public article id in to the user----")

// 	const mongoConnection =
// 		config.dataBaseConnection.name === "users_db"
// 			? config.dataBaseConnection
// 			: config.dataBaseConnection.useDb("users_db")

// 	const userId = mongoose.Types.ObjectId(req.body.article.authorId)

// 	console.log("Айдишник пришедшего юзера: " + req.body.article.authorId)

// 	await mongoConnection
// 		.collection("user_collection")
// 		.updateOne({ _id: userId }, { $push: { "articles.public": { articleId: res.locals.articleNewId } } })
// 		.then(
// 			(updateResult) => {
// 				console.log("Нашли пользователя и записали в енего публичную статью")
// 				console.log(updateResult.result)
// 				next()
// 			},
// 			(updateError) => {
// 				console.log("Update user draft array error: " + updateError)
// 				res.sendStatus(204)
// 				// res.send(JSON.stringify({ msg: "Update user draft array error" }))
// 			}
// 		)
// }

// post
router.post("/", [writeToPublishedInArticlesDB, removeFromDraftsInArticlesDB], async (req, res) => {
	// console.log("----Write public article id in to the user----")
	await res.sendStatus(201)
	// 	const mongoConnection =
	// 		config.dataBaseConnection.name === "users_db"
	// 			? config.dataBaseConnection
	// 			: config.dataBaseConnection.useDb("users_db")

	// 	const userId = mongoose.Types.ObjectId(req.body.article.authorId)
	// 	const oldArticleId = mongoose.Types.ObjectId(req.body.article.articleOldId)

	// 	// console.log("Айдишник пришедшего юзера: " + req.body.article.authorId)

	// 	await mongoConnection
	// 		.collection("user_collection")
	// 		.updateOne({ _id: userId }, { $pull: { "articles.draft": { articleId: oldArticleId } } })
	// 		.then(
	// 			(updateResult) => {
	// 				console.log("Нашли пользователя и удалили из него черновую статью")
	// 				console.log(updateResult.result)
	// 				res.sendStatus(201)
	// 			},
	// 			(updateError) => {
	// 				console.log("Update user draft array error: " + updateError)
	// 				res.sendStatus(204)
	// 				// res.send(JSON.stringify({ msg: "Update user draft array error" }))
	// 			}
	// 		)
})

module.exports = router
