"use strict"

const express = require("express")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const app = express()
const mongoose = require("mongoose")
const config = require("./config/config")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const { env } = require("process")
const localEnv = require("./config/env")

// const multer = require("multer")
// const storage = multer.memoryStorage()
// const upload = multer({ storage: storage })

//admin auth actions
const login = require("./Routes/auth/login/index")
const register = require("./Routes/auth/registration/index")
const logout = require("./Routes/auth/logout/index")
const checkAvailability = require("./Routes/auth/check-availability/index")

//admin content actions
const saveDraftArticle = require("./Routes/upload-article/save-draft/index")
const updateDraftArticle = require("./Routes/upload-article/update-draft/index")
const publishNewArticle = require("./Routes/upload-article/publish-new/index")
const publishDraftArticle = require("./Routes/upload-article/publish-draft/index")

//user content actions
const userGetAllArticles = require("./Routes/articles/all/index")
const userGetArticle = require("./Routes/article/index")

const SESSECRET = env.SESSECRET || localEnv.SESSECRET
const NODEPORT = env.NODEPORT || localEnv.NODEPORT

app.set("trust proxy", 1)

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const mongoSessionStore = MongoStore.create(config.mongoStoreConnectionOptions)
app.use(
	session({
		genid: function (req) {
			return uuidv4()
		},
		secret: `${SESSECRET}`,
		cookie: {
			maxAge: 86400000 / 2, // 12 hours
			secure: false,
			httpOnly: false,
			sameSite: false,
			path: "/",
		},
		store: mongoSessionStore,
		resave: false,
		saveUninitialized: false,
		unset: "destroy",
	})
)

//admin auth actions
app.use("/api/auth/login", [cors(), login])
app.use("/api/auth/registration", [cors(), register])
app.use("/api/auth/logout", [cors(), logout])
app.use("/api/auth/check-availability", [cors(), checkAvailability])

//admin content actions
app.use("/api/upload-article/save-draft", [cors(), saveDraftArticle])
app.use("/api/upload-article/publish-new", [cors(), publishNewArticle])
app.use("/api/upload-article/publish-draft", [cors(), publishDraftArticle])
app.use("/api/upload-article/update-draft", [cors(), updateDraftArticle])

//user content actions
app.use("/articles/all", userGetAllArticles)
app.use("/article", userGetArticle)

// app.post("/api/uploadImage", upload.single("article-image"), async (req, res) => {
// 	// console.log("app post image upload")
// 	let imagePath = req.file.originalname.replace(/\s/g, "_") + ".webp"
// 	await sharp(req.file.buffer)
// 		.webp()
// 		.toFile(`./static/article_images/${imagePath}`)
// 		.then(() => {
// 			res.send(JSON.stringify({ imageName: imagePath }))
// 		})
// })

app.listen(NODEPORT, async (err) => {
	if (err) console.log("error", err)
	else {
		config.dataBaseConnection = await mongoose.createConnection(
			config.mongoConnectionString("articles_db"),
			config.mongoConnectionOptions
		)
	}
	console.log(`backend started on env port: ${NODEPORT}`)
})
