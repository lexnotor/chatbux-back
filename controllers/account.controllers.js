import { v2 as cloudinaryV2 } from "cloudinary";
import e from "express";
import mongoose from "mongoose";
import { User } from "../database/models.js";


/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const getGroupData = async (req, res) => {

}


/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const getChatData = async (req, res) => {

}


/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const getMyInfo = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ msg: "User not connected" })
    }
    const response = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.user.id) } },
        { $project: { password: 0 } }
    ]).exec();
    await User.populate(response, { path: 'groupes', select: ['membres', 'latest'] });
    await User.populate(response, { path: 'conversations', select: ['chatter', 'latest'] });
    await User.populate(response, { path: 'conversations.chatter', select: ['nom', 'prenom', 'username', 'image'] });
    const userData = response.map(elm => ({
        id: elm._id,
        nom: elm.nom,
        prenom: elm.prenom,
        username: elm.username,
        email: elm.email,
        uri: elm.uri,
        image: elm.image,
        groupes: elm.groupes,
        conversations: elm.conversations
    }))
    return res.status(200).json({ data: userData })
}

/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const getAllUsers = async (req, res) => {
    const response = await User.aggregate([
        {
            $project: {
                nom: 1,
                prenom: 1,
                username: 1,
                email: 1,
                uri: 1,
                image: 1
            }
        }
    ]).exec();
    const userList = response.map(elm => ({
        id: elm._id,
        nom: elm.nom,
        prenom: elm.prenom,
        username: elm.username,
        email: elm.email,
        uri: elm.uri,
        image: elm.image
    }))
    return res.status(200).json({ data: userList })
}

export const uploadProfile = async (req, res) => {
    if (!req.user) {
        return res.status(403).json({ msg: "Uploading failled, user not connected" })
    }
    if (req.file) {
        try {
            const base64_encoded = req.file.buffer.toString("base64");
            const cloudFile = await cloudinaryV2.uploader.upload(`data:${req.file.mimetype};base64,${base64_encoded}`);
            const url = cloudFile.url;
            const response = await User.updateOne({
                _id: new mongoose.Types.ObjectId(req.user.id)
            }, {
                $set: {
                    image: url
                }
            });
            if (response.modifiedCount == 1) return res.status(200).json({ msg: 'Photo Uploaded', data: url });
            else return res.status(400).json({ msg: 'Updating picturer failled, ' });
        } catch (error) {
            return res.status(400).json({ msg: 'Sending picturer failled' })
        }
    }
}