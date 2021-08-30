const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
	email: { type: String, required: true, index: { unique: true } },
	password: { type: String, required: true },
	salt: { type: String, required: true },
	role: { type: String, required: true, default: "user" },
	name: { type: String, default: "nickname" },
	// articles: {
	// 	draft: { type: Array },
	// 	public: { type: Array },
	// },
	joinDate: { type: Date, default: Date.now() },
})

module.exports = mongoose.model("User", UserSchema)
