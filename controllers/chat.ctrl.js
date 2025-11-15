const Chat = require("../models/chat.model.js")
const User = require("../models/user.model.js")

async function accessChat(req, res) {
    try {
        const { userId } = req.body
        if (!userId) {
            res.status(400).json("No id provided")
        }
        var isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ]
        }).populate("users", "-password").populate("latestMessages")

        isChat = await User.populate(isChat, {
            path: "latestMessages.sender",
            select: "name email"
        })

        if (isChat > 0) {
            res.json(isChat[0])
        }
        else {
            var chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId]
            }
        }


        const createChat = await Chat.create(chatData)

        const fullChat = await Chat.findOne({ _id: createChat._id }).populate("users", "-password")

        res.json(fullChat)

    } catch (error) {
        res.status(500).json({ message: error })
    }
}

//function to get all chats between all users
async function getChat(req, res) {
    try {
        // get users id chat depending on chat id
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessages")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessages   .sender",
                    select: "name email"
                })
                res.status(200).json(results)
            })
    } catch (error) {
        req.status(500).json({ message: error })
    }
}

async function createGroupChat(req, res) {
    try {

        // to check if missing group name or users array
        if (!req.body.users || !req.body.name) {
            return res.status(400).json("Missed Required Fields")
        }

        // get users from users array body
        var users = req.body.users
        //var users = JSON.parse(req.body.users)

        // admin must add at least 2 users to his group
        if (users.length < 2) {
            return res.status(400).json("you have to add more than 2 users")
        }

        // push every single user to users array
        users.push(req.user)

        //create new group chat
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        })

        // get a group chat info
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')

        res.status(200).json(fullGroupChat)
    } catch (error) {
        res.status(500).json({ message: error })
    }
}

async function renameGroup(req, res) {
    try {
        const { chatId, chatName } = req.body

        const updateChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
            .populate("groupAdmin", "-password")
            .populate("users", "-password")

        if (!updateChat) {
            res.status(400).json("Invalid chat")
        }

        res.status(200).json(updateChat)
    } catch (error) {

    }
}

async function addToGroup(req, res) {
    try {
        const { chatId, userId } = req.body;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (chat.users.includes(userId)) {
            return res.status(400).json({ message: "User already exists in the group" });
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $addToSet: { users: userId } },
            { new: true }
        )
            .populate("groupAdmin", "-password")
            .populate("users", "-password");

        return res.status(200).json(updatedChat);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function removeFromGroup(req, res) {
    try {
        const { chatId, userId } = req.body

        const updateChat = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
            .populate("groupAdmin", "-password")
            .populate("users", "-password")

        if (!updateChat) {
            res.status(400).json("Invalid chat")
        }

        res.status(200).json(updateChat)
    } catch (error) {

    }
}

module.exports = { accessChat, getChat, createGroupChat, renameGroup, addToGroup, removeFromGroup }