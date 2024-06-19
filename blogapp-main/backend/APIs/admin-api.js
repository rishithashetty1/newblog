//create admin-apiapp

const exp=require('express');
     adminApp=exp.Router();

     
     adminApp.get('/test-admin',(req,res)=>{
        res.send({message:"this is admin api"})
     })



     








//exporting 
module.exports=adminApp;