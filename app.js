let express=require("express");
let svgCaptcha = require('svg-captcha');
let path=require('path');
let session = require('express-session');
let bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';

const dbName = 'test';


let app=express();

//托管静态资源
app.use(express.static('static'));

app.use(session({
    secret: 'keyboard cat'
    // resave: false,
    // saveUninitialized: true,
    // cookie: { secure: true }
  }))

  // 使用 bodyParser 中间件
app.use(bodyParser.urlencoded({
    extended: false
}))



// 去登陆页
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'static/views/login.html'));
})
//验证码
app.get('/login/captchsImg',(req,res)=>{
    var captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;
    // console.log(captcha.text);
	
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
})
//去首页
app.get('/index',(req,res)=>{
    if(req.session.userInfo){
        res.sendFile(path.join(__dirname,'static/views/index.html'));
    }else{
        res.setHeader('content-type','text/html');
        res.send('<script>alert("请登录");window.location="/login"</script>');
    }
})
//登录操作
app.post('/login',(req,res)=>{
    let username=req.body.username;
    let userpass=req.body.userpass;
    let usercode=req.body.usercode;
    if(usercode==req.session.captcha){
        req.session.userInfo={
            username
        }
        res.redirect('/index')
    }else{
        res.setHeader('content-type','text/html');
        res.send('<script>alert("验证码错误");window.location="/login"</script>');
    }
})
//登出操作
app.get('/logout',(req,res)=>{
    delete req.session.userInfo;
    res.redirect('/login');
})
//去注册页
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'static/views/register.html'));
})
//注册逻辑
app.post('/register',(req,res)=>{
    let username=req.body.username;
    let userpass=req.body.userpass;
    // console.log(req);
    // console.log(userpass);
    // console.log(username);
    MongoClient.connect(url, function(err, client) {
        const db = client.db(dbName);
        const collection = db.collection('userList');
        collection.find({username}).toArray(function(err, docs) {
            if(docs.length==0){
                // 说明没查询到有此用户名注册过,可以注册
                collection.insertOne({
                    username,
                    userpass
                },(err,result)=>{
                    if(!err){
                        //注册成功,提示用户,调到登陆页
                        res.setHeader('content-type','text/html');
                        res.send('<script>alert("注册成功,欢迎加入我们");window.location="/login"</script>')
                    }
                })
            }
          });


       //关闭数据库连接
        // client.close();
      });

})







app.listen(8848,"127.0.0.1",()=>{
    console.log("success");
})

