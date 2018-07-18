let express=require("express");
let path=require('path');
let indexRouter=express.Router();


indexRouter.get('/',(req,res)=>{
    if(req.session.userInfo){
        res.sendFile(path.join(__dirname,'../static/views/index.html'));
    }else{
        res.setHeader('content-type','text/html');
        res.send('<script>alert("请登录");window.location="/login"</script>');
    }
})
module.exports = indexRouter;