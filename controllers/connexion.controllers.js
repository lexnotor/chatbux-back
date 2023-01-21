import e from "express";
import { User } from "../database/models.js";
import { allUserOnline, createToken, hashPassword } from "../psw-manager/index.js";

/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const userLogin = async (req, res) => {
    /**
     * @type {{ userid: String, psw: String }}
     */
    const { userid, psw } = req.body;

    // verify all fields are provided
    if (!userid || !psw) {
        return res.status(406).json({ msg: 'Provide password and at least email or username' });
    }
    userid.replace(/^.*$/, userid.trim());
    psw.replace(/^.*$/, psw.trim());

    // verify credentials are not empty
    if (!userid.length) {
        return res.status(406).json({ msg: 'Username or Email, is required' });
    }
    if (!psw.length) {
        return res.status(406).json({ msg: 'Password is required' });
    }

    try {
        // Search user in database
        const userData = await User.findOne({
            $or: [
                { email: userid },
                { username: userid }
            ],
            password: hashPassword(psw)
        }, { password: 0 }).exec();
        // If no user found
        if (!userData) {
            return res.status(401).json({ msg: "userid and password don't match" })
        }

        // save user in session && generate token
        const toSerialize = {
            id: userData.id,
            username: userData.username,
            nom: userData.nom,
            prenom: userData.prenom,
            email: userData.email,
            image: userData.image
        }
        const userToken = createToken(toSerialize);
        allUserOnline.push({ token: userToken, id: userData.id, username: userData.username });

        return res.status(200).json({ token: userToken, msg: 'Connected', ...toSerialize });
    } catch (error) {
        console.log(error);
        return res.status(503).json({ msg: 'A error occurate, please contact admin' });
    }
}


/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const userSignup = (req, res) => {
    /**
     * @type {{ username:String, email:String, nom:String, prenom:String, psw:String }}
     */
    const { username, email, nom, prenom, psw } = req.body;
    // verify all fields are provided
    if (!username || !email || !nom || !prenom || !psw) {
        return res.status(406).json({ msg: "must provide all fields" });
    }

    // remove all landing space from fields
    username.replace(/^.*$/, username.trim());
    email.replace(/^.*$/, email.trim());
    nom.replace(/^.*$/, nom.trim());
    prenom.replace(/^.*$/, prenom.trim());
    psw.replace(/^.*$/, psw.trim());

    // verify all fields schema are correct
    if (username.length < 6) {
        return res.status(406).json({ msg: "username must contain at least 6 characters" });
    }
    if (nom.length < 6) {
        return res.status(406).json({ msg: "nom must contain at least 6 characters" });
    }
    if (prenom.length < 6) {
        return res.status(406).json({ msg: "prenom must contain at least 6 characters" });
    }
    if (psw.length < 6) {
        return res.status(406).json({ msg: "psw must contain at least 6 characters" });
    }
    if (!/^[a-zA-Z0-9._]{3,20}@[a-z0-9]{3,20}\.[a-z]{2,10}$/.test(email)) {
        console.log(email);
        return res.status(406).json({ msg: "Provide a valid email" });
    }

    // If all tests success, save user and response with status created
    const newUser = {
        username,
        email,
        nom,
        prenom,
        password: hashPassword(psw)
    };
    new User(newUser)
        .save()
        .then(() => {
            return res.status(201).json({ msg: "user created" });
        })
        .catch(() => {
            return res.status(409).json({ msg: "user can't be create" })
        });
}


/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const userLogout = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ msg: 'Logout impossible, unknown user' })
    }
    const tokenIndex = allUserOnline.findIndex(user => {
        return user.token == req.user.token
    });
    if (tokenIndex == -1) {
        return res.status(200).json({ msg: 'Logout impossible, not connected' })
    }
    allUserOnline.splice(tokenIndex, 1);
    return res.status(200).json({ msg: 'Successfully logout, goodbye' })
}


/**
 * @param {e.Request} req 
 * @param {e.Response} res 
 */
export const refreshToken = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ msg: 'Refresh impossible, unknown user' })
    }
    const tokenIndex = allUserOnline.findIndex(user => {
        user.token == req.user.token
    });
    if (tokenIndex == -1) {
        return res.status(401).json({ msg: 'Refresh impossible, not connected' })
    }
    try {
        const userToRefresh = allUserOnline[tokenIndex];
        // Search user in database
        const userData = await User.findOne({
            _id: userToRefresh.id
        }, { password: 0 }).exec();
        // If no user found
        if (!userData) {
            return res.status(401).json({ msg: "Refresh impossible, user not found" })
        }

        // save user in session && generate token
        const toSerialize = {
            id: userData.id,
            username: userData.username,
            nom: userData.nom,
            prenom: userData.prenom,
            email: userData.email,
            image: userData.image
        };
        userToRefresh.token = createToken(toSerialize);
        userToRefresh.id = userData.id;
        userToRefresh.username = userData.username;

        return res.status(200).json({ token: userToRefresh.token, msg: 'Connected', ...toSerialize });
    } catch (error) {
        return res.status(503).json({ msg: 'A error occurate, please contact admin' });
    }
}
