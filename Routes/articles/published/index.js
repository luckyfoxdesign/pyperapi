"use strict"

const express = require("express")
const router = express.Router()
const mongooose = require("mongoose")
const { json } = require("body-parser")
const config = require("../../../../config/config")

function returnFindOptions(skip = 0, limit = 0) {
	return {
		skip: skip,
		limit: limit,
		sort: [["dateCreated", "descending"]],
	}
}

router.use(json())

router.get("/", async (req, res) => {
	// console.log("----1----")
	// console.log("процесс чтения базы с публичными статьями")

	// console.log(req.query.id)

	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	const userId = mongooose.Types.ObjectId(req.query.id)

	await mongoConnection
		.collection("publicArticles_collection") // получаем доступ к коллекции документов
		.find({ authorId: userId }, returnFindOptions())
		.project({ content: 0 })
		.toArray()
		.then((findResult) => {
			// console.log("Ураа, нашли статьи, возвращаем результаты")
			// console.log(findResult)
			res.status(200).send(JSON.stringify({ result: findResult }))
		})
		.catch((err) => {
			console.error(`Failed to find documents: ${err}`)
			res.sendStatus(204)
		})
})

module.exports = router
