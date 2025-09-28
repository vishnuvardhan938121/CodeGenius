const express= require("express") 
const aiRoutes= require('./routes/ai.routes') // Correctly loads the router definition
const cors= require('cors')
const app= express() 

// 1. Middleware for JSON parsing MUST be placed before routes
// This is critical for reading req.body.code
app.use(express.json()) 

// 2. Middleware for CORS MUST be placed before routes
app.use(cors()) 

// 3. Registering the AI routes under the /ai prefix
app.use('/ai',aiRoutes)

app.listen(4000,()=>
{
 console.log("server is running on port 4000")
})

// Simple test route
app.get('/',(req,res)=>
{
res.send("Hello world")
}) 

module.exports= app
