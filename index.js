const express = require("express");
const app = express();
const path = require("path");
const upload = require("./config/multer");
app.use(express.json());

app.use(express.static("public"));

let admin = require("firebase-admin");

// private key generated
let serviceAccount = require("./fbpk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // check firebase credentials
  storageBucket: "gs://something.appspot.com",
});

let bucket = admin.storage().bucket();

app.post("/upload", upload.single("myfile"), async (req, res) => {
  // file should be sent as a form entry named myfile
  let { filename } = req.file;
  let imageData = await bucket.upload(
    path.join(__dirname, "public", "uploads", filename)
  );
  if (imageData) res.json({ success: "true", filename });
});

app.get("/images/:imagename", async (req, res) => {
  let { imagename } = req.params;
  let destination = path.join(__dirname, "public", "downloads", imagename);
  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination,
  };

  // Downloads the file
  bucket
    .file(imagename)
    .download(options)
    .then(() => {
      // file present in destination is sent to the client
      res.sendFile(destination);
    })
    .catch((err) => console.log(err));
});

app.listen(5000, () => console.log("Listening to port 5000"));
