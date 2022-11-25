import crypto from 'crypto'
import jwt from 'jsonwebtoken'

// Use this to generate JSON Web Token
export const privateKey = crypto.createHash('sha512').update(new Date().toDateString()).digest('hex');

// function to hash password
export const hashPassword = (psw) => {
    return crypto.createHash('sha512').update(psw).digest('hex')
}

// generate Token
export const createToken = (data = {}, key = privateKey) => {
    const token = jwt.sign(data, key, { expiresIn: 60 * 60 * 3 });
    return token;
}

// stock session
/**
 * @type {{ token: String, id: String, username: String }[]}
 */
export const allUserOnline = [];
