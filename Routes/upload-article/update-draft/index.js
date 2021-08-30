"use strict"

const express = require("express")
const router = express.Router()
const { json } = require("body-parser")
const mongoose = require("mongoose")
const config = require("../../../../config/config")

function returnFindOptions(skip = 0, limit = 4) {
	return {
		skip: skip,
		limit: limit,
		sort: [["dateCreated", "descending"]],
	}
}

router.use(json())

const updateArticleInArticlesDB = async (req, res, next) => {
	console.log("----Update draft article id in to the user----")

	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	const articleCurrentId = mongoose.Types.ObjectId(req.body.article.articleOldId)

	res.locals.articleCurrentId = articleCurrentId

	await mongoConnection
		.collection("draftArticles_collection")
		.updateOne(
			{ _id: articleCurrentId },
			{
				$currentDate: {
					dateCreated: true,
				},
				$set: {
					title: req.body.article.title,
					subtitle: req.body.article.subtitle,
					content: req.body.article.content,
				},
			}
		)
		.then(
			(updateResult) => {
				console.log("Нашли пользователя и записали в енего статью")
				next()
			},
			(updateError) => {
				console.log("Update user draft array error: " + updateError)
				res.status(204).send(JSON.stringify({ msg: "Update user draft array error" }))
			}
		)
}

router.post("/", updateArticleInArticlesDB, async (req, res) => {
	// console.log("----Get user draft after remove----")
	// console.log("процесс чтения базы с драфтовыми статьями")
	const userId = mongoose.Types.ObjectId(req.body.article.authorId)

	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	await mongoConnection
		.collection("draftArticles_collection") // получаем доступ к коллекции документов
		.find({ _id: res.locals.articleCurrentId }, returnFindOptions())
		.project({ content: 0, previewSrc: 0, subtitle: 0 })
		.toArray()
		.then(
			async (findResult) => {
				// console.log("Ураа, драфтовую нашли статьи, записали в переменную")
				// console.log(findResult)
				await mongoConnection
					.collection("draftArticles_collection")
					.countDocuments({ authorId: userId }, returnFindOptions())
					.then((countResult) => {
						// console.log(countResult)
						res.status(201).send(
							JSON.stringify({
								result: { drafts: findResult, draftsCount: countResult },
							})
						)
					})
			},
			(findError) => {
				console.log("Find draft articles after deleting error: " + findError)
				// res.send({ msg: "Find draft articles error after remove" })
				res.sendStatus(204)
			}
		)
		.catch((err) => {
			console.error(`Failed to find documents then finding in draft articles: ${err}`)
			// res.send(JSON.stringify({ msg: "Failed to find documents " }))
			res.sendStatus(204)
		})
})

module.exports = router
