import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import aiChatRouter from './routes/aiChatRoutes.js'
import connectDb from './config/mongodb.js'

const app = express()

await connectCloudinary()
await connectDb()

// CORRECT CORS SETUP
app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true
}))

app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res)=>res.send('Server is Live!'))

app.use(requireAuth())

app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)
app.use('/api/chat', aiChatRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log('Server is running in port', PORT)
})
