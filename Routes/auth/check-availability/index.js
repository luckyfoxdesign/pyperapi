"use strict"

const express = require("express")
const router = express.Router()
const { json } = require("body-parser")
const config = require("../../../config/config")

router.use(json())

router.get("/", async (req, res) => {
	const mongoConnection =
		config.dataBaseConnection.name === "sessions_db"
			? config.dataBaseConnection
			: config.dataBaseConnection.useDb("sessions_db")

	console.log(req.sessionID)

	mongoConnection
		.collection("sessions")
		.findOne({ _id: req.sessionID })
		.then((r) => {
			console.log(r)
			if (r != null) {
				res.status(200).send("ok")
			} else {
				res.status(404).send("no")
			}
		})
})

module.exports = router
