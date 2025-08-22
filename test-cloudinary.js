require("dotenv").config();
const cloudinary = require("cloudinary").v2;
console.log("Testing cloud config .....");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


cloudinary.api
  .ping()
  .then((res) => console.log("Cloudinary connection succesful", res.status))
    .catch((err) => {
        console.log("Cloudinary connection failed", err);
        console.log(process.env.CLOUDINARY_CLOUD_NAME);
        console.log(process.env.CLOUDINARY_API_KEY);
        console.log(process.env.CLOUDINARY_API_SECRET);
  });