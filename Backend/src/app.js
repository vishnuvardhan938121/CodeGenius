const express= require("express") 
const aiRoutes= require('./routes/ai.routes') 
const cors= require('cors')
const app= express() 



app.use(express.json()) 


app.use(cors()) 


app.use('/ai',aiRoutes)

app.listen(4000,()=>
{
 console.log("server is running on port 4000")
})


app.get('/',(req,res)=>
{
res.send("Hello world")
}) 

module.exports= app
