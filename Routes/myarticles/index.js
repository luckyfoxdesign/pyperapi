"use strict"

const express = require("express")
const router = express.Router()
const { json } = require("body-parser")
const mongoose = require("mongoose")
const config = require("../../../config/config")

const articles = {
	published: "",
	publishedCount: 0,
	draft: "",
	draftsCount: 0,
}

function returnFindOptions(skip = 0, limit = 4) {
	return {
		skip: skip,
		limit: limit,
		sort: [["dateCreated", "descending"]],
	}
}

router.use(json())

router.use("/", async (req, res, next) => {
	// console.log("----1----")
	// console.log("процесс чтения базы с публичными статьями")

	const userId = mongoose.Types.ObjectId(req.query.id)

	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	await mongoConnection
		.collection("publicArticles_collection") // получаем доступ к коллекции документов
		.find({ authorId: userId }, returnFindOptions())
		.project({ content: 0, previewSrc: 0, subtitle: 0 })
		.toArray()
		.then(
			async (findResult) => {
				// console.log("Ураа, нашли публичные статьи, записали в переменную")
				articles.published = findResult

				await mongoConnection
					.collection("publicArticles_collection")
					.countDocuments({ authorId: userId })
					.then((countResult) => {
						articles.publishedCount = countResult
						next()
					})
			},
			(findError) => {
				console.log(findError)
				res.status(204).send({ msg: "Find my public articles error" })
			}
		)
		.catch((err) => {
			console.error(`Failed to find documents: ${err}`)
			res.status(204).send(JSON.stringify({ msg: "Failed to find documents " }))
		})
})

router.use("/", async (req, res) => {
	// console.log("----Get user draft for the admin----")
	// console.log("процесс чтения базы с драфтовыми статьями")

	const userId = mongoose.Types.ObjectId(req.query.id)

	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	await mongoConnection
		.collection("draftArticles_collection") // получаем доступ к коллекции документов
		.find({ authorId: userId }, returnFindOptions())
		.project({ content: 0, previewSrc: 0, subtitle: 0 })
		.toArray()
		.then(
			async (findResult) => {
				// console.log("Ураа, нашли статьи, записали в переменную")
				// console.log(findResult)
				articles.draft = findResult
				await mongoConnection
					.collection("draftArticles_collection")
					.countDocuments({ authorId: userId })
					.then((countResult) => {
						articles.draftsCount = countResult
						res.status(200).send(JSON.stringify({ articles }))
					})
			},
			(findError) => {
				console.log(findError)
				res.sendStatus(204)
			}
		)
		.catch((err) => {
			console.error(`Failed to find documents: ${err}`)
			res.sendStatus(204)
		})
})

module.exports = router
