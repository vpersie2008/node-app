const Validator = require("validator");
const isEmpty = require("./is-Empty");

module.exports = function validateRegisterInput(data){
    let errors = {};
    if (!Validator.isLength(data.name,{min:2,max:30})) {
        errors.name = "名字的长度不能小于2位，且不能大于30位！";
    }

    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if(Validator.isEmpty(data.name)){
        errors.name = "名字不能为空!";
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "邮箱不能为不能为空!";
    }

    if (Validator.isEmpty(data.password)) {
        errors.password = "密码不能为空！";
    }

    if(!Validator.isLength(data.password,{min:6,max:30})){
        errors.password = "密码需要在6位到30位之间";
    }

    return {
        errors,
        isValid:isEmpty(errors)
    }

}