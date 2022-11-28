import app from "./app.js";
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinaryV2 } from 'cloudinary'

dotenv.config()

// configure mongodb
await mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connection to database : Ok"))
    .catch((reason) => {
        console.log(reason);
        process.exit(0);
    })


// configure cloudinary
cloudinaryV2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


const server = http.createServer(app)


const listerners = server.listen(process.env.PORT || 3500, () => {
    console.log('Server started on port ' + listerners.address().port);
})
