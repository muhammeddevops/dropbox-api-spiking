require("dotenv").config({ path: `${__dirname}/../.env.test` });
// Load environment variables from .env file

// Express server code for handling file uploads
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Dropbox = require("dropbox").Dropbox;
const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

// connect to my MongoDB database
mongoose.connect(
  "mongodb+srv://reactors:Northcoders123@cluster0.ndnpdfj.mongodb.net/test",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Define the schema for the files
const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  url: String,
});

// Create a model from the schema
const File = mongoose.model("File", fileSchema);

// Allow all requests from any domain
app.use(cors());

// set up middleware
app.use(bodyParser.json());

// Create the uploads directory if it doesn't already exist
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: "uploads/" });

const dbx = new Dropbox({
  accessToken:
    "sl.BbUEH38Nq2da5dwbcklIb6MI6FcidIrHDhcG_tVS5lmiEOs9LZCXpH1FgKysR5Pgn9ffHm7OlVX9pflbc6tnYatkJQspanNrEwG36mqpEoXY6UUbqWY2my0bCHPtYOY6FSCWq3Dee7A",
});

app.get("/api/random", (req, res) => {
  res.status(200).send("got it");
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;

  // Append a timestamp to the file name
  const fileNameParts = file.originalname.split(".");
  const fileNameWithoutExt = fileNameParts
    .slice(0, fileNameParts.length - 1)
    .join(".");
  const fileExt = fileNameParts[fileNameParts.length - 1];
  const timestamp = new Date().getTime();
  const newFileName = `${fileNameWithoutExt}-${timestamp}.${fileExt}`;

  fs.readFile(file.path, (err, contents) => {
    if (err) {
      console.log(err, "<<< err");
      return res.sendStatus(500);
    }

    dbx
      .filesUpload({
        path: "/" + newFileName,
        contents: contents,
      })
      .then(async () => {
        const link = await dbx.sharingCreateSharedLinkWithSettings({
          path: "/" + newFileName,
        });
        const imageUrl = link?.result?.url?.replace("dl=0", "raw=1");

        // Create a new File object to store the image URL in MongoDB
        const newFile = new File({
          filename: newFileName,
          path: file.path,
          url: imageUrl,
        });

        await newFile.save();

        // Store the imageUrl in MongoDB here
        res.set("Content-Type", "application/json");
        res.status(200).send({ imageUrl });
      })
      .catch((error) => {
        console.log(error, "<<< error");
        res.sendStatus(500);
      });
  });
});

// Start the server
app.listen(9090, () => console.log("Server running on port 9090"));
