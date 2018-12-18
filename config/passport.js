const mongoose = require("mongoose");
const User = mongoose.model("users");
const passportJwt = require('passport-jwt');
// const passport = require("passport");
// passport.initialize();

const keys = require("../config/keys");

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.secretOrKey
}

//加了auth之后，先执行这块代码，验证是否有auth
module.exports = passport => {
    
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {

        console.log(jwt_payload);

        User.findById({_id: "5c13b13f33f7ec1b548f3cfc"})
            .then(user => {
                if (user) {
                    //这里会将从数据库查询到结果，将user返回给调用的接口的req ,会合并到调用接口的 req对象上去
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            })
            .catch(err => console.log(err));

    }));
}


//总结：
/**
 * 1.登录时，使用jsonwebtoken 先生成一个token，注意这个token必须是 "Bearer "开头的
 * 2.使用passport-jwt 来验证auth
 * 
 */