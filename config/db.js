const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log(`mongo created ${connect.connection.host}`);
    } catch (error) {
        console.error({ message: error });
    }
}

module.exports = connectDB