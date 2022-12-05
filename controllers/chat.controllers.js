import e from "express";
import mongoose from "mongoose";
import { Chat, User } from "../database/models.js";
import { v2 as cloudinaryV2 } from "cloudinary";
import { allUserOnline } from "../psw-manager/index.js";



/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const sendMessage = async (req, res) => {
    if (!req.user) {
        return res.status(403).json({ msg: "Sending message impossible, user not connected" })
    }
    // Extract message data
    let { to, content } = req.body, type = 'text';
    if (!to || (to.length < 12)) {
        return res.status(400).json({ msg: "Sending message impossible, receiver not specify" })
    }
    // Try to upload image to cloudinary
    if (req.file) {
        try {
            const base64_encoded = req.file.buffer.toString("base64");
            const cloudFile = await cloudinaryV2.uploader.upload(`data:${req.file.mimetype};base64,${base64_encoded}`);
            content = cloudFile.url
            type = 'image'
        } catch (error) {
            return res.status(400).json({ msg: 'Sending picturer failled' })
        }
    }
    // Verify the receiver exists
    try {
        const response = await User.findOne({
            _id: new mongoose.Types.ObjectId(to)
        }).exec()
        if (!response) {
            return res.status(400).json({ msg: "Sending message impossible, receiver not found" })
        }
    } catch (error) {
        return res.status(400).json({ msg: "Sending message impossible, unknow receiver" })
    }
    // Save the message in the data base
    try {
        const exist = await Chat.findOne({
            chatter: {
                $all: [
                    new mongoose.Types.ObjectId(to),
                    new mongoose.Types.ObjectId(req.user.id)
                ]
            }
        }, { _id: 1 });
        const filter = exist ? { _id: exist._id } : {
            chatter: [
                new mongoose.Types.ObjectId(to),
                new mongoose.Types.ObjectId(req.user.id)
            ]
        };
        const response = await Chat.updateOne(filter, {
            $push: {
                messages: {
                    sender: new mongoose.Types.ObjectId(req.user.id),
                    genre: type,
                    content: content
                }
            },
            $set: {
                latest: new Date()
            }
        }, { upsert: true }).exec();
        if (response.upsertedId) {
            await User.updateMany({
                _id: {
                    $in: [new mongoose.Types.ObjectId(to), new mongoose.Types.ObjectId(req.user.id)]
                }
            }, {
                $push: {
                    conversations: response.upsertedId
                }
            }).exec();
            const newChat = await Chat.findOne({
                chatter: {
                    $all: [
                        new mongoose.Types.ObjectId(to),
                        new mongoose.Types.ObjectId(req.user.id)
                    ]
                }
            });
            const chatRes = {
                id: newChat.id,
                chatter: newChat.chatter,
                latest: newChat.latest,
                messages: newChat.messages.map(elm => ({
                    id: elm.id,
                    sender: elm.sender,
                    genre: elm.genre,
                    content: elm.content,
                    time: elm.time,
                    read: elm.read
                }))
            }
            const receiverData = allUserOnline.find(elm => (elm.id == to && elm.socket));
            if (receiverData && receiverData.socket.connected) {
                receiverData.socket.emit('newmsg', chatRes)
            }
            return res.status(201).json({ msg: 'Begin new Chat', id: response.upsertedId, data: chatRes })
        }
        const newChat = await Chat.findOne({
            chatter: {
                $all: [
                    new mongoose.Types.ObjectId(to),
                    new mongoose.Types.ObjectId(req.user.id)
                ]
            }
        });
        const chatRes = {
            id: newChat.id,
            chatter: newChat.chatter,
            latest: newChat.latest,
            messages: newChat.messages.map(elm => ({
                id: elm.id,
                sender: elm.sender,
                genre: elm.genre,
                content: elm.content,
                time: elm.time,
                read: elm.read
            }))
        }
        const receiverData = allUserOnline.find(elm => (elm.id == to && elm.socket));
        if (receiverData && receiverData.socket.connected) {
            receiverData.socket.emit('newmsg', chatRes)
        }
        return res.status(200).json({ msg: `Message sent, ${response.modifiedCount}`, data: chatRes })
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: `sending impossible` })
    }
}


/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const getOneChat = async (req, res) => {
    if (!req.user) {
        return res.status(403).json({ msg: "Can't get chat, user not connected" })
    }
    const { chat: chatid, chatter } = req.query;
    if (!chatid && !chatter) {
        return res.status(400).json({ msg: 'Please specify a chat' })
    }
    try {
        const filter = chatid ?
            { _id: new mongoose.Types.ObjectId(chatid) } :
            { chatter: { $in: [new mongoose.Types.ObjectId(chatter)] } }
        const response = await Chat.findOne({
            $or: [
                filter
            ],
            chatter: { $in: [new mongoose.Types.ObjectId(req.user.id)] }
        }).exec();
        if (!response) throw new Error("Not chat found");
        const chatRes = {
            id: response.id,
            chatter: response.chatter,
            latest: response.latest,
            messages: response.messages.map(elm => ({
                id: elm.id,
                sender: elm.sender,
                genre: elm.genre,
                content: elm.content,
                time: elm.time,
                read: elm.read
            }))
        }
        return res.status(200).json({ data: chatRes, msg: 'find' })
    } catch (error) {
        return res.status(400).json({ msg: 'Chat not found or not authorize' })
    }
}


/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const getAllChat = async (req, res) => {
    if (!req.user) {
        return res.status(403).json({ msg: "Can't get chats, user not connected" })
    }
    try {
        const response = await Chat.find({
            chatter: { $in: [new mongoose.Types.ObjectId(req.user.id)] }
        }).exec();
        if (!response) throw new Error("Not chat found");

        const chatRes = []
        response.forEach(chat => {
            const chatParsed = {
                id: chat.id,
                chatter: chat.chatter,
                latest: chat.latest,
                messages: chat.messages.map(elm => ({
                    id: elm.id,
                    sender: elm.sender,
                    genre: elm.genre,
                    content: elm.content,
                    time: elm.time,
                    read: elm.read
                }))
            }
            chatRes.push(chatParsed);
        })
        return res.status(200).json({ data: chatRes, msg: 'find' })
    } catch (error) {
        return res.status(400).json({ msg: 'Chat not found or not authorize' })
    }
}

