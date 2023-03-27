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

// connect to MongoDB
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
    "sl.BbV5Ik_iC5QE_SrP-96Awig3yXpKDvN9ybjn6NLGU2S2-XOW1837VLqc15dfuu7fSpPb80gpb50rJMLMzuo8YYkuOHsxqmzTXZduVdNh2sqnttjd7GRI_cagCPMLYcmAwUCBjrOd",
});

app.get("/api/random", (req, res) => {
  res.status(200).send("got it");
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;

  fs.readFile(file.path, (err, contents) => {
    if (err) {
      console.log(err, "<<< err");
      return res.sendStatus(500);
    }

    dbx
      .filesUpload({
        path: "/" + file.originalname,
        contents: contents,
      })
      .then(async () => {
        const link = await dbx.sharingCreateSharedLinkWithSettings({
          path: "/" + file.originalname,
        });
        const imageUrl = link?.result?.url?.replace("dl=0", "raw=1");

        // Create a new File object to store the image URL in MongoDB
        const newFile = new File({
          filename: file.originalname,
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

// dbx
//   .filesUpload({
//     path: "/" + file.originalname,
//     contents: contents,
//   })
//   .then(() => {
//     res.set("Content-Type", "application/json");
//     res.sendStatus(200);
//   })
//   .catch((error) => {
//     console.log(error);
//     res.sendStatus(500);
//   });

// try {
//   // Upload the file to Dropbox
//   const response = await dbx.filesUpload({
//     path: "/" + file.originalname,
//     contents: contents,
//   });

//    // Save the file information to MongoDB
//    const newFile = new File({
//     filename: file.originalname,
//     path: file.path,
//     url: response.path_display,
//   });
//   await newFile.save();

// }
