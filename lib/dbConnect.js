import mongoose from 'mongoose'

export const dbConnect=async()=>{
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Connected to MongoDB!!!")

    } catch (error) {
        console.log("Error in Connecting to DB",error);
    }
}