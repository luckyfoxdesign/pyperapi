"use strict"

const express = require("express")
const router = express.Router()
const { json } = require("body-parser")
const config = require("../../../../config/config")

function returnFindOptions(skip = 0, limit = 20) {
	return {
		skip: skip,
		limit: limit,
		sort: [["dateCreated", "descending"]],
	}
}

router.use(json())

router.use("/", async (req, res) => {
	// console.log("----1----")
	// console.log("процесс чтения базы с публичными статьями")

	await config.dataBaseConnection
		.collection("publicArticles_collection") // получаем доступ к коллекции документов
		.find({}, returnFindOptions())
		.project({ content: 0 })
		.toArray()
		.then((findResult) => {
			// console.log("Ураа, нашли статьи, возвращаем результаты")
			// console.log(findResult)
			res.send(JSON.stringify({ result: findResult }))
		})
		.catch((err) => {
			console.error(`Failed to find documents: ${err}`)
			res.status(204)
		})
})

module.exports = router
