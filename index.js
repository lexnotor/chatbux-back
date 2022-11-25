import app from "./app.js";
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config()
console.log(process.env.MONGODB_URI);
await mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connection on database : Ok"))
    .catch((reason) => {
        console.log(reason);
        process.exit(0);
    })

const server = http.createServer(app)


const listerners = server.listen(process.env.PORT || 3500, () => {
    console.log('Server started on port ' + listerners.address().port);
})
