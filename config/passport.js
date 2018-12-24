const mongoose = require("mongoose");
const User = mongoose.model("users");
const passportJwt = require('passport-jwt');
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

        //jwt_payload 这个对象，是登录时使用jsonwebtoken使用jwt.sign(rule) 这个方法中，rule所对应的值，即制定token规则
        /*
         * 之前生成时rule为登录成功的如下对象
         *      const rule = {
                    id: user.id,
                    name: user.name
                };
         */

        User.findById({_id: jwt_payload.id})
            .then((user) => {
                if (user) {
                    //这里会将从数据库查询到结果，将user返回给调用的接口的req ,会合并到调用接口的 req对象上去
                    //done为回调后合并到req中的数据，其中第一个参数为error，第二个参数为数据，如user
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