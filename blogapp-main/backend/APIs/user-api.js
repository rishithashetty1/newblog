
const exp=require('express');
const userApp=exp.Router();
const bcryptjs=require('bcryptjs')
const expressAsyncHandler=require("express-async-handler")
const jwt=require('jsonwebtoken')
const verifyToken=require('../MIddlewares/verifyToken')
require('dotenv').config()

     let usercollection;
      let articlescollection;
     userApp.use((req,res,next)=>{
      usercollection=req.app.get('userscollection')
      articlescollection=req.app.get('articlescollection')
      next()
     })

//registration route


userApp.post('/users',expressAsyncHandler(async(req,res)=>{
   
   const newUser=req.body;
   
   const dbuser=await usercollection.findOne({username:newUser.username})
   
   if(dbuser!= null){
       res.send({message:"User existed"})
   }else{
      
       const hashedPassword=await bcryptjs.hash(newUser.password,6)
       
       newUser.password=hashedPassword;
       
       await usercollection.insertOne(newUser)
      
       res.send({message:"user created"})
   }

}))


// login
userApp.post('/login',expressAsyncHandler(async(req,res)=>{
   
   const userCred=req.body;
   
   const dbuser= await usercollection.findOne({username:userCred.username})
   if(dbuser===null){
       res.send({message:"Invalid username"})
   }else{
       
      const status= await bcryptjs.compare(userCred.password,dbuser.password)
      if(status===false){
       res.send({message:"Invalid password"})
      }else{
   
       const signedToken=jwt.sign({username:dbuser.username},process.env.SECRET_KEY,{expiresIn:'1d'});
   
       res.send({message:"login success",token:signedToken,user:dbuser})
      }
   }
}))



userApp.get('/articles',verifyToken,expressAsyncHandler(async(req,res)=>{
   //get articlescollection from express app
   const articlescollection = req.app.get('articlescollection')
   //get all articles
   let articlesList=await articlescollection.find({status:true}).toArray()
   //send res
   res.send({message:"articles",payload:articlesList})
}))




//post comments for an arcicle by atricle id
userApp.post(
   "/comment/:articleId",verifyToken,
   expressAsyncHandler(async (req, res) => {
     //get user comment obj
     const userComment = req.body;
     const articleIdFromUrl=(+req.params.articleId);
     //insert userComment object to comments array of article by id
     let result = await articlescollection.updateOne(
       { articleId: articleIdFromUrl},
       { $addToSet: { comments: userComment } }
     );
     console.log(result);
     res.send({ message: "Comment posted" });
   })
 );




//exporting 
module.exports=userApp;