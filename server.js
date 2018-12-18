const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const passport = require("passport");
const db = require('./config/keys');

const app = express();
const users = require("./routes/api/users");//将路由下的users引入

//连接MongoDB
mongoose.connect(db.mongoURI)
    .then(()=>console.log(`Mongodb connected to ${db.mongoURI}`))
    .catch(err => console.log(err));

//使用body-parser
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());

//passport 初始化
app.use(passport.initialize());

//传入passport 到passport.js,这样这个文件就不需要重新再引入passport 
require("./config/passport")(passport);

//使用中间件,设置users的路由,必须先加载body-parser再加载路由，因为程序是顺序执行的，有依赖关系
app.use("/api/users",users);

const port = process.env.PORT || 5000;

app.listen(port,()=>{
    console.log(`Server is runnding ${port}`);
})


