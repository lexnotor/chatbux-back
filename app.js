import e from "express";
import connectRouter from './routes/connexion.routes.js'

const app = e();

app.use(e.urlencoded({ extended: false }));

app.use('/api/v1/connect',)


export default app