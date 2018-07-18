let express=require("express");
let svgCaptcha = require('svg-captcha');
let path=require('path');
let session = require('express-session');
let bodyParser = require('body-parser');
//导入自己的路由
let indexRouter=require(path.join(__dirname,'route/indexRouter.js'))

//链接数据库封装到了myT中,此处不需再引入
// const MongoClient = require('mongodb').MongoClient;
// const url = 'mongodb://127.0.0.1:27017';
// const dbName = 'test';

//引入自己封装的函数
let myT=require(path.join(__dirname,'tools/myT.js'));


let app=express();

//托管静态资源
app.use(express.static('static'));

app.use(session({
    secret: 'keyboard cat',
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
//挂载首页路由中间件到index路径下
app.use('/index',indexRouter);

//写入主页路由中
// app.get('/index',(req,res)=>{
//     if(req.session.userInfo){
//         res.sendFile(path.join(__dirname,'static/views/index.html'));
//     }else{
//         res.setHeader('content-type','text/html');
//         res.send('<script>alert("请登录");window.location="/login"</script>');
//     }
// })
//登录操作
app.post('/login',(req,res)=>{
    let username=req.body.username;
    let userpass=req.body.userpass;
    let usercode=req.body.usercode;
    if(usercode==req.session.captcha){
        //说明验证码正确,继续验证用户名和密码
        myT.find('userList',{username},(err,docs)=>{
            if(!err){
                console.log(docs);
                //说明数据库没有问题,继续验证用户名密码
                if(docs.length==1){
                    //保存登陆状态
                    req.session.userInfo={
                        username
                    }
                    //提示用户去首页
                    myT.mess(res,"欢迎回来","/index");
                    // res.redirect('/index')
                }else{
                    myT.mess(res,"用户名或密码错误","/login");
                }
            }else{
                console.log("数据库连接失败");
            }
        })
        
    }else{
        myT.mess(res,'验证码错误','/login');
        // res.setHeader('content-type','text/html');
        // res.send('<script>alert("验证码错误");window.location="/login"</script>');
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
    myT.find('userList',{username},(err,docs)=>{
        //查询是否注册过
        if(docs.length==0){
            //没注册过,可以注册
            myT.insert('userList',{username,userpass},(err,result)=>{
                console.log(result);
                if(!err){
                    myT.mess(res,"欢迎加入我们,去登陆吧!","/login");     
                }
            })
            
        }else{
            //已注册,提示用户并返回
            myT.mess(res,"该用户名已被注册,换其它的试试","/register");
        }

    })
    // MongoClient.connect(url, function(err, client) {
    //     const db = client.db(dbName);
    //     const collection = db.collection('userList');
    //     collection.find({username}).toArray(function(err, docs) {
    //         if(docs.length==0){
    //             // 说明没查询到有此用户名注册过,可以注册
    //             collection.insertOne({
    //                 username,
    //                 userpass
    //             },(err,result)=>{
    //                 if(!err){
    //                     //注册成功,提示用户,调到登陆页
    //                     res.setHeader('content-type','text/html');
    //                     res.send('<script>alert("注册成功,欢迎加入我们");window.location="/login"</script>')
    //                 }
    //             })
    //         }
    //       });


       //关闭数据库连接
        // client.close();
    //   });

})


app.listen(8848,"127.0.0.1",()=>{
    console.log("success");
})

