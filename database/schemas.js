import { Schema, Types } from "mongoose";



export const userSchema = new Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: "",
        unique: true
    },
    uri: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    tokkens: [{
        content: String,
        time: {
            type: Date,
            default: new Date(Date.now() + 1000 * 60 * 60 * 24)
        }
    }],
    groupes: [{
        type: Types.ObjectId,
        ref: 'groups'
    }],
    conversations: [{
        type: Types.ObjectId,
        ref: 'chats'
    }]
})


export const groupeMessageSchema = new Schema({
    sender: {
        type: Types.ObjectId,
        ref: 'users'
    },
    content: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        default: 'text'
    },
    readby: [{
        type: Types.ObjectId,
        ref: 'users'
    }],
    time: {
        type: Date,
        default: () => new Date()
    }
})

export const groupSchema = new Schema({
    code: {
        type: String,
        default: '123456789'
    },
    membres: [{
        type: Types.ObjectId,
        ref: 'users'
    }],
    latest: {
        type: Date,
        default: () => new Date()
    },
    chats: [groupeMessageSchema]
});


export const chatMessageSchema = new Schema({
    sender: {
        type: Types.ObjectId,
        ref: 'users'
    },
    content: {
        type: String,
        require: true
    },
    genre: {
        type: String,
        default: 'text'
    },
    read: {
        type: Boolean,
        default: false
    },
    time: {
        type: Date,
        default: () => new Date()
    }
})

export const chatSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    chatter: {
        type: [Types.ObjectId],
        ref: 'users',
        required: [function () { return this.chatter.length >= 2 }, "Must be more than 2"]
    },
    latest: {
        type: Date,
        default: () => new Date()
    },
    messages: [chatMessageSchema]
})
