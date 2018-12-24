const Validator = require("validator");
const isEmpty = require("./is-Empty");

module.exports = function validatePostsInput(data){
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text : '';

    if(Validator.isEmpty(data.text)){
        errors.text = "评论不能为空";
    }

    if (!Validator.isLength(data.text,{min:10,max:500})) {
        errors.text = "最少评论10个字";
    }

    return {
        errors,
        isValid:isEmpty(errors)
    }
}