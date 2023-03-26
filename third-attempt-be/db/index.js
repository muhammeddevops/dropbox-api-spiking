require("dotenv").config({ path: `${__dirname}/../.env.test` });
// Load environment variables from .env file

// Express server code for handling file uploads
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Dropbox = require("dropbox").Dropbox;
const fs = require("fs");

const app = express();

// Allow all requests from any domain
app.use(cors());

// Create the uploads directory if it doesn't already exist
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: "uploads/" });

const dbx = new Dropbox({
  accessToken:
    "sl.BbVD2iM0GGQyvkGMYfcJPpWumOBrJyv3CDLSztEl7VaMHBnd7vk8JYZaQW1rYf7SR6uuUbvnd4xBgaJfMhOJasssoRjCmXw3D9UQiipx0Tqpu0H644lKQ3DIISbZ3dx6GiZhBpQP",
});

app.get("/api/random", (req, res) => {
  res.status(200).send("got it");
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;

  fs.readFile(file.path, (err, contents) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    dbx
      .filesUpload({
        path: "/" + file.originalname,
        contents: contents,
      })
      .then(() => {
        res.set("Content-Type", "application/json");
        res.sendStatus(200);
      })
      .catch((error) => {
        console.log(error);
        res.sendStatus(500);
      });
  });
});
// Start the server
app.listen(9090, () => console.log("Server running on port 9090"));
