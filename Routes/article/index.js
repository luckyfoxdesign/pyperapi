"use strict"

const express = require("express")
const router = express.Router()
const { json } = require("body-parser")
const mongoose = require("mongoose")
const config = require("../../../config/config")

function returnDBCollectionName(type) {
	if (type === "draft") return "draftArticles_collection"
	else return "publicArticles_collection"
}

router.use(json())

router.use("/", async (req, res) => {
	const pathString = req.path.substring(1)
	const articleId = mongoose.Types.ObjectId(pathString.substring(pathString.length - 24))

	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	// тут может быть проблема т.к если при сохранении, в названии статьи будет знак -
	// то тут он просто знак удалит, т.к при передаче с клиента на сервер пробелы заменяются на знак -, а тут он

	// он этот знак просто удалит
	const articleTitle = decodeURI(pathString.slice(0, -25).replace(/-/g, " "))

	// возможно стоит рассмотреть добавление к статье хеша -1d1d2d12frebt4
	// а при выводе на клиент - удалять его
	// и искать можно будет как статья+хеш, а не передавать дополнительно ее айди

	// console.log(articleName)
	await mongoConnection
		.collection(returnDBCollectionName(req.query.type)) // получаем доступ к коллекции документов
		// .collection("publicArticles_collection")
		.findOne({ _id: articleId, title: articleTitle })
		.then(
			(findResult) => {
				// console.log("Ураа, нашли статьи, возвращаем результаты")
				// console.log(findResult)
				res.status(200).send(JSON.stringify({ result: findResult }))
			},
			(findOneError) => {
				console.log(findOneError)
				res.status(204)
			}
		)
		.catch((err) => {
			console.error(`Failed to find documents: ${err}`)
			res.status(204)
		})
})

module.exports = router
