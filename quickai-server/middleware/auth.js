import { clerkClient } from "@clerk/express"
import jwt from "jsonwebtoken"

// Middleware to check userID and hasPremiumPlan

export const auth = async(req, res, next)=>{
    try {
        const {userId, has} = await req.auth()
        const hasPremiumPlan = await has({plan: 'premium'})

        const user = await clerkClient.users.getUser(userId)

        if(!hasPremiumPlan && user.privateMetadata.free_usage){
            req.free_usage = user.privateMetadata.free_usage
        } else {
            await clerkClient.users.updateUserMetadata(userId,{
                privateMetadata: {
                    free_usage: 0
                }
            })
            req.free_usage = 0
        }
        req.plan = hasPremiumPlan ? 'premium' : 'free'
        next()
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const protect = async (req,res,next) => {
    let token = req.headers.authorization
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decoded.id
        req.userId = userId
        next()
    } catch (error) {
        res.status(401).json({message: "Unauthorized"})
    }
}
