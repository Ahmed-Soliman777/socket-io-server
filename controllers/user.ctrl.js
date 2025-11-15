const generateToken = require('../config/generateToken.js')
const User = require('../models/user.model.js')

async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            res.status(400).json({ message: "missing required paramters" })
        }
        const user = await User.create({ name, email, password, })
        if (user) {
            res.status(200).json({ name, email, token: generateToken(user._id) })
            // console.log(user.password);
        }
    } catch (error) {
        res.status(500).json({ message: error })
    }
}

async function handleLogin(req, res) {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user || !(await user.comparePassword(password))) {
            res.status(400).json("Invalid user")
        }

        if (!email || !password) {
            res.status(400).json({ message: "missing required paramters" })
        }

        if (user) {
            res.status(200).json({ email: user.email, name: user.name, token: generateToken(user._id) })
        }
    } catch (error) {
        res.status(500).json({ message: error })
    }
}

async function getUsers(req, res) {
    try {
        const { search, lastname } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        if (lastname) {
            query.lastname = { $regex: lastname, $options: "i" };
        }

        const users = await User.find(query).find({ _id: { $ne: req.user._id } });

        res.json(users);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = { registerUser, handleLogin, getUsers }