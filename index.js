import app from "./app";
import http from 'http';
import dotenv from 'dotenv';

dotenv.config()

const server = http.createServer(app)


const listerners = server.listen(process.env.PORT || 3500, () => {
    console.log('Server started on port ' + listerners.address().port);
})
