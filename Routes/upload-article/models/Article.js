"use strict"

const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ArticleSchema = new Schema({
	_id: Schema.Types.ObjectId,
	title: String,
	subtitle: String,
	content: Array,
	authorId: Schema.Types.ObjectId,
	previewSrc: String,
	dateCreated: { type: Date, default: Date.now() },
})

module.exports = mongoose.model("Article", ArticleSchema)
