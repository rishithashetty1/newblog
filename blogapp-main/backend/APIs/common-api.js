const exp=require('express');
const commonApp=exp.Router();


commonApp.get('/common',(res,req)=>{
    res.setEncoding({message:'common api'})
})






module.exports=commonApp;