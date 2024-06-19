const exp=require('express')
const app=exp()


require('dotenv').config()

const mongoClient=require('mongodb').MongoClient;
const path=require('path')



//react bulid deplyment 
app.use(exp.static(path.join(__dirname,'../client/build')))




app.use(exp.json())

mongoClient.connect(process.env.DB_URL)
.then(client=>{
    const blogdb=client.db('blogdb')

    const userscollection=blogdb.collection('userscollection')

    const articlescollection=blogdb.collection('articlescollection')
    const authorscollection=blogdb.collection('authorscollection')
    //share colelction obj with express app
    app.set('userscollection',userscollection)
    app.set('articlescollection',articlescollection)
    app.set('authorscollection',authorscollection)
    console.log('DB connection sucess')
})
.catch(err=>console.log("Error in DB connection",err))











//importing rouytes
const userApp=require('./APIs/user-api')
const adminApp=require('./APIs/admin-api')
const authorApp=require('./APIs/author-api')

//if path is user-api send request to user-api



app.use('/user-api',userApp)

app.use('/admin-api',adminApp)


app.use('/author-api',authorApp)

app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'../client/build/index.html'))

    
})


//error handling
app.use((err,req,res,next)=>{
    res.send({message:"error",payload:message})
})


const port=process.env.PORT || 5000;
app.listen(port,()=>console.log(`Web server on port ${port}`))