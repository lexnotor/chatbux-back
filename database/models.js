import { userSchema, chatSchema, groupSchema } from './schemas.js'
import { model } from 'mongoose'

export const User = model('users', userSchema);
export const Chat = model('chats', chatSchema);
export const Group = model('groups', groupSchema);
