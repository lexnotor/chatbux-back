import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import "../index.js"
import app from "../app.js";

chai.use(chaiHttp);

describe("Creation d'un compte", () => {
    /**
     * 
     *  @type {ChaiHttp.Agent}
     */
    var r;
    before(() => {
        r = chai.request(app).keepOpen()
    });
    after(() => {
        r.close();
    })
    it("should create user Test02", (done) => {
        r.post('/api/v1/connect/signup')
            .type('form')
            .send({
                email: "usertest2@chatbux.local",
                psw: "Test123",
                username: "usertest2",
                nom: "ChatbuxUser",
                prenom: "ChatbuxTest"
            })
            .end((err, res) => {
                assert.equal(res.body.msg, "user created")
                assert.equal(res.status, 201)
                done()
            })
    })
    it("shouldn't create user Test01, He exists", (done) => {
        r.post('/api/v1/connect/signup')
            .type('form')
            .send({
                email: "usertest@chatbux.local",
                psw: "Test123",
                username: "usertest",
                nom: "ChatbuxUser",
                prenom: "ChatbuxTest"
            })
            .end((err, res) => {
                assert.equal(res.body.msg, "user can't be create")
                assert.equal(res.status, 409)
                done()
            })
    })
    it("shouldn't create user Test01, no data provided", (done) => {
        r.post('/api/v1/connect/signup')
            .type('form')
            .send({})
            .end((err, res) => {
                assert.equal(res.body.msg, "must provide all fields")
                assert.equal(res.status, 406)
                done()
            })
    })
    it("shouldn't create user Test01, username is invalid", (done) => {
        r.post('/api/v1/connect/signup')
            .type('form')
            .send({
                email: "usertest@chatbux.local",
                psw: "Test123",
                username: "use",
                nom: "ChatbuxUser",
                prenom: "ChatbuxTest"
            })
            .end((err, res) => {
                assert.equal(res.body.msg, "username must contain at least 6 characters")
                assert.equal(res.status, 406)
                done()
            })
    })
    it("shouldn't create user Test01, name is invalid", (done) => {
        r.post('/api/v1/connect/signup')
            .type('form')
            .send({
                email: "usertest@chatbux.local",
                psw: "Test123",
                username: "usertest",
                nom: "ch",
                prenom: "ChatbuxTest"
            })
            .end((err, res) => {
                assert.equal(res.body.msg, "nom must contain at least 6 characters")
                assert.equal(res.status, 406)
                done()
            })
    })
    it("shouldn't create user Test01, prenom is invalid", (done) => {
        r.post('/api/v1/connect/signup')
            .type('form')
            .send({
                email: "usertest@chatbux.local",
                psw: "Test123",
                username: "usertest",
                nom: "ChatbuxUser",
                prenom: "te"
            })
            .end((err, res) => {
                assert.equal(res.body.msg, "prenom must contain at least 6 characters")
                assert.equal(res.status, 406)
                done()
            })
    })
    it("shouldn't create user Test01, password is invalid", (done) => {
        r.post('/api/v1/connect/signup')
            .type('form')
            .send({
                email: "usertest@chatbux.local",
                psw: "er",
                username: "usertest",
                nom: "ChatbuxUser",
                prenom: "ChatbuxTest"
            })
            .end((err, res) => {
                assert.equal(res.body.msg, "psw must contain at least 6 characters")
                assert.equal(res.status, 406)
                done()
            })
    })
    it("shouldn't create user Test01, email is invalid", (done) => {
        r.post('/api/v1/connect/signup')
            .type('form')
            .send({
                email: "usertest@chatbux.",
                psw: "Test123",
                username: "usertest",
                nom: "ChatbuxUser",
                prenom: "ChatbuxTest"
            })
            .end((err, res) => {
                assert.equal(res.body.msg, "Provide a valid email")
                assert.equal(res.status, 406)
                done()
            })
    })
})
