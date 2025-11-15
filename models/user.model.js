const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userModel = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true })

userModel.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    try {
        const salt = await bcrypt.genSalt(12)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (err) {
        next(err)
    }
})


userModel.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password)
}

const User = mongoose.model("User", userModel)
module.exports = User