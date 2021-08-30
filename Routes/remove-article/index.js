"use strict"

const express = require("express")
const router = express.Router()
const { json } = require("body-parser")
const mongoose = require("mongoose")
const config = require("../../../config/config")

function returnFindOptions(skip = 0, limit = 4, query = "") {
	return {
		skip: skip,
		limit: query != "drafts" ? limit : 0,
		sort: [["dateCreated", "descending"]],
	}
}

router.use(json())

const removeDraftArticleFromArticlesDB = async (req, res, next) => {
	// console.log("----Delete Article from drafts----")
	// console.log("Ид статьи: " + req.query.id)
	// console.log("Название статьи: " + req.query.name)

	const articleId = mongoose.Types.ObjectId(req.query.id)
	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	// const articleName = req.query.name.replace(/-/g, " ")

	await mongoConnection
		.collection("draftArticles_collection") // получаем доступ к коллекции документов
		.findOneAndDelete({ _id: articleId, title: req.query.name })
		.then(
			(deleteResult) => {
				// console.log("Удаляем статью из драфтов")
				// console.log(deleteResult.result)
				// res.send(JSON.stringify({ msg: "Удалили статью" }))
				next()
			},
			(deleteError) => {
				console.log("Deleting article from draft articles: " + deleteError)
				// res.send({ msg: "Value lookup error" })
				res.status(204)
			}
		)
		.catch((err) => {
			console.error(`Failed to find documents in draft articles: ${err}`)
			// res.send(JSON.stringify({ msg: "Failed to find documents " }))
			res.status(204)
		})
}

// router.use("/", async (req, res, next) => {
// 	// console.log("----Delete from user Article----")
// 	// console.log("Ид статьи: " + req.query.id)
// 	// console.log("ид юзера: " + req.query.userid)

// 	const mongoConnection = config.dataBaseConnection.useDb("users_db")

// 	const userId = mongoose.Types.ObjectId(req.query.userid)
// 	const articleId = mongoose.Types.ObjectId(req.query.id)

// 	// console.log(articleName)
// 	await mongoConnection
// 		.collection("user_collection") // получаем доступ к коллекции документов
// 		.updateOne({ _id: userId }, { $pull: { "articles.draft": { articleId: articleId } } })
// 		.then(
// 			(updateResult) => {
// 				// console.log("Удаляем статью из пользователя")
// 				// console.log(updateResult.result)
// 				next()
// 				// res.send(JSON.stringify({ msg: "Удалили статью" }))
// 			},
// 			(updateError) => {
// 				console.log("Deleting draft from user error: " + updateError.result)
// 				// res.send(JSON.stringify({ msg: "Ошибка удаления статьи" }))
// 				res.status(204)
// 			}
// 		)
// 		.catch((err) => {
// 			console.error(`Failed to find documents: ${err}`)
// 			// res.send(JSON.stringify({ msg: "Failed to find documents " }))
// 			res.status(204)
// 		})
// })

router.delete("/", removeDraftArticleFromArticlesDB, async (req, res) => {
	// console.log("----Get user draft after remove----")
	// console.log("процесс чтения базы с драфтовыми статьями")

	const userId = mongoose.Types.ObjectId(req.query.userid)
	const mongoConnection =
		config.dataBaseConnection.name === "articles_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("articles_db")

	await mongoConnection
		.collection("draftArticles_collection") // получаем доступ к коллекции документов
		.find({ authorId: userId }, returnFindOptions(0, 0, req.query.f))
		.project({ content: 0, previewSrc: 0, subtitle: 0 })
		.toArray()
		.then(
			async (findResult) => {
				// console.log(findResult)
				await mongoConnection
					.collection("draftArticles_collection")
					.countDocuments({ authorId: userId })
					.then((countResult) => {
						res.status(200).send(
							JSON.stringify({
								result: { drafts: findResult, draftsCount: countResult },
							})
						)
					})
			},
			(findError) => {
				console.log("Find draft articles after deleting error: " + findError)
				// res.send({ msg: "Find draft articles error after remove" })
				res.status(204)
			}
		)
		.catch((err) => {
			console.error(`Failed to find documents then finding in draft articles: ${err}`)
			// res.send(JSON.stringify({ msg: "Failed to find documents " }))
			res.status(204)
		})
})

module.exports = router
