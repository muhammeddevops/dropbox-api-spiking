import "./App.css";

// React front-end code for uploading an image
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("file", file);

    //try {
    //   await
    axios
      .post("http://localhost:9090/api/upload", formData, {
        headers: {
          Authorization: `Bearer sl.BbUEH38Nq2da5dwbcklIb6MI6FcidIrHDhcG_tVS5lmiEOs9LZCXpH1FgKysR5Pgn9ffHm7OlVX9pflbc6tnYatkJQspanNrEwG36mqpEoXY6UUbqWY2my0bCHPtYOY6FSCWq3Dee7A`,
        },
      })
      .then((response) => {
        alert("File uploaded successfully");
        // Use the Dropbox API to retrieve the image URL
        const filePath = response.data.path_display;
        axios
          .post("http://localhost:9090/api/getImage", { filePath })
          .then((response) => {
            setImageUrl(response.data);
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        alert("Error uploading file");
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {imageUrl && <img src={imageUrl} alt="your piccc" />}
    </div>
  );
}

export default App;
