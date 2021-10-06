"use strict"

const express = require("express")
const router = express.Router()
const config = require("../../../config/config")

const { json } = require("body-parser")
router.use(json())

router.get("/", async (req, res) => {
	console.log(config.mongoStore)
	await config.mongoStore.destroy(req.sessionID, (err) => {
		if (!err) {
			console.log("if")
			res.sendStatus(200)
		} else {
			console.log("else")
			res.sendStatus(500)
		}
	})
})

module.exports = router
