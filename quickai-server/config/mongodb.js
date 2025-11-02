import mongoose from "mongoose"

const connectDb = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("Database connected") )
        await mongoose.connect(`${process.env.MONGODB_URI}/quickai`)
    } catch (error) {
        console.log(`"Database is showing error in the process of connection to MongoDB Atlas.. The error is ${error}"`)
    }
}

export default connectDb