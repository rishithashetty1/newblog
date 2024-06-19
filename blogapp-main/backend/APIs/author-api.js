
const exp=require('express');
const authorApp=exp.Router();  
const bcryptjs=require('bcryptjs')
const expressAsyncHandler=require("express-async-handler")
const jwt=require('jsonwebtoken')
const verifyToken=require('../MIddlewares/verifyToken')
require('dotenv').config()

     let authorscollection;
     let articlescollection;

     
     authorApp.use((req,res,next)=>{
      authorscollection=req.app.get('authorscollection')
      articlescollection=req.app.get('articlescollection')
      next()
     })

//registration route


authorApp.post('/authors',expressAsyncHandler(async(req,res)=>{
   
   const newauthor=req.body;
   
   const dbauthor=await authorscollection.findOne({username:newauthor.username})
   
   if(dbauthor!= null){
       res.send({message:"Author existed"})
   }else{
      
       const hashedPassword=await bcryptjs.hash(newauthor.password,6)
       
       newauthor.password=hashedPassword;
       
       await authorscollection.insertOne(newauthor)
      
       res.send({message:"author created"})
   }

}))


// login
authorApp.post('/login',expressAsyncHandler(async(req,res)=>{
   
   const authorCred=req.body;
   
   const dbauthor= await authorscollection.findOne({username:authorCred.username})
   if(dbauthor===null){
       res.send({message:"Invalid username"})
   }else{
       
      const status= await bcryptjs.compare(authorCred.password,dbauthor.password)
      if(status===false){
       res.send({message:"Invalid password"})
      }else{
   
       const signedToken=jwt.sign({username:dbauthor.authorname},process.env.SECRET_KEY,{expiresIn:'1d'})
   
       res.send({message:"login success",token:signedToken,user:dbauthor})
      }
   }
}))


//adding new article by author
authorApp.post('/article',verifyToken,expressAsyncHandler(async(req,res)=>{
   //get new article from client
   const newArticle=req.body;
   //post to artciles collection
   await articlescollection.insertOne(newArticle)
   //send res
   res.send({message:"New article created"})
}))


//modify artcile by author
authorApp.put('/article',verifyToken,expressAsyncHandler(async(req,res)=>{
   //get modified article from client
   const modifiedArticle=req.body;
  
   //update by article id
  let result= await articlescollection.updateOne({articleId:modifiedArticle.articleId},{$set:{...modifiedArticle}})
  let latestArticle=await articlescollection.findOne({articleId:modifiedArticle.articleId})
   res.send({message:"Article modified",article:latestArticle})
}))

//delete an article by article ID
authorApp.put('/article/:articleId',verifyToken,expressAsyncHandler(async(req,res)=>{
   //get articleId from url
   const artileIdFromUrl=(+req.params.articleId);
    //get article 
    const articleToDelete=req.body;

    if(articleToDelete.status===true){
       let modifiedArt= await articlescollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:false}},{returnDocument:"after"})
       res.send({message:"Article deleted",payload:modifiedArt.status})
    }
    if(articleToDelete.status===false){
        let modifiedArt= await articlescollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:true}},{returnDocument:"after"})
        res.send({message:"Article restored",payload:modifiedArt.status})
    }
}))


//read articles of author
authorApp.get('/articles/:username',verifyToken,expressAsyncHandler(async(req,res)=>{
   //get author's username from url
   const username=req.params.username;
   //get atricles whose status is true
   const artclesList=await articlescollection.find({username:username}).toArray()
   res.send({message:"List of atricles",payload:artclesList})

}))





















//exporting 
module.exports=authorApp;








//exporting 
module.exports=authorApp;