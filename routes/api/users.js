const express = require("express"); //引入express
const router = express.Router(); //获取express中的路由
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");//使用jsonwebtoken用于生成一个token，用于验证登录
const passport = require("passport");
const key = require("../../config/keys");
const User = require("../../models/Users");
const validateRegisterInput = require("../../validation/register");
//加盐加密规则
const saltRounds = 10;

//使用express 搭建restful api GET api/users/test
router.get("/users", (req, res) => {

    User
        .findOne({name: "jerry wang"})
        .then(user => res.json(user));

});

//$route POST api/users/register @description 返回请求的json数据 Register
router.post("/register", (req, res) => {

    const {errors,isValid} = validateRegisterInput(req.body);
    
    if(!isValid){
        return res.status(400).json(errors);
    }

    User
        .findOne({email: req.body.email})
        .then((user) => {
            if (user) {
                return res
                    .status(400)
                    .json({email: "邮箱已被注册"});
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar: req.body.avatar,
                    password: bcrypt.hashSync(req.body.password, saltRounds) //使用bcrpt同步加密
                });

                newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));

            }
        })

});

//Login
router.post("/login", (req, res) => {
    const {email, password} = req.body;
    User
        .findOne({email: email})
        .then(user => {
            if (!user) {
                return res
                    .status(404)
                    .json({email: "用户不存在"});
            }

            const isMatch = bcrypt.compareSync(password, user.password);
            if (isMatch) {
                const rule = {
                    id: user.id,
                    name: user.name
                };

                //使用json web token在登录成功后，生成一个token,使用异步形式生成
                //参数rule，一个规则对象
                jwt.sign(rule, key.secretOrKey, {expiresIn: 3600}, (err, token) => {
                    res.json({success: true, message: "login success!", token: `${key.bearer}${token}`});
                });

            } else {
                return res.json({message: "password error!"});
            }

        })

})

//验证token
router.get("/current", passport.authenticate("jwt", {session: false}), (req, res) => {

    const result = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    };
    
    return res.json({"success":true});

});

//将router导出
module.exports = router;