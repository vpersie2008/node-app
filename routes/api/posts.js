const express = require("express"); //引入express
const router = express.Router(); //获取express中的路由
const passport = require("passport");
const validatePostsInput = require("../../validation/posts");
const Post = require("../../models/Post");

router.post("/", passport.authenticate("jwt", {session: false}), (req, res) => {

    const {errors, isValid} = validatePostsInput(req.body);

    const newPost = new Post({
        text: req.body.text, name: req.body.name, avator: req.body.avator, user: req.user.id //登录状态,可以获取到id
    });

    if (!isValid) {
        res
            .status(400)
            .json(errors);
    }

    newPost
        .save()
        .then(post => {
            res
                .status(200)
                .json(post)
        });

});

router.get("/", (req, res) => {

    Post
        .find()
        .sort({date: -1})
        .then(posts => {
            res.json(posts)
        })
        .catch(err => {
            res
                .status(404)
                .json({notfound: "找不到任何评论信息"});
        })
});

//获取单个评论信息
router.get("/:id", (req, res) => {

    Post
        .findById(req.params.id)
        .then(post => {
            res.json(post)
        })
        .catch(err => {
            res
                .status(404)
                .json({notfound: "找不到该评论信息"});
        })
});

//删除评论
router.delete('/:id', passport.authenticate("jwt", {session: false}), (req, res) => {

    Post
        .findById(req.params.id)
        .then(post => {

            console.log("post user:" + post.user.toString());
            if (post.user.toString() !== req.user.id) {

                return res
                    .status(401)
                    .json({notauthorized: "用户非法操作"})
            }

            post
                .remove()
                .then(() => res.json({success: true}));

        })
        .catch(err => res.status(404).json({postNotfound: "未找到数据"}));
})

//点赞
router.post("/like/:id", passport.authenticate("jwt", {session: false}), (req, res) => {
    Post
        .findById(req.params.id)
        .then(post => {
            if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                return res
                    .status(400)
                    .json({alreadyLiked: "该用户已赞过"})
            }

            post
                .likes
                .unshift({user: req.user.id});

            post
                .save()
                .then(post => res.json(post));

        })
        .catch(err => res.status(404).json({likedError: "点赞错误"}));
})

//取消点赞
router.post("/unlike/:id", passport.authenticate("jwt", {session: false}), (req, res) => {
    Post
        .findById(req.params.id)
        .then(post => {
            if (post.likes.filter(like => like.user.toString() === req.user.id).length == 0) {
                return res
                    .status(400)
                    .json({alreadyLiked: "该用户没有点过赞"})
            }

            //获取要删除的 user id
            const removeIndex = post
                .likes
                .map(item => item.user.toString())
                .indexOf(req.user.id);
            post
                .likes
                .splice(removeIndex, 1);

            post
                .save()
                .then(post => res.json(post));

        })
        .catch(err => res.status(404).json({likedError: "取消点赞错误"}));
})

//添加评论

router.post("/comment/:id", passport.authenticate("jwt", {session: false}), (req, res) => {

    const {errors, isValid} = validatePostsInput(req.body);
    if (!isValid) {
        return res
            .status(400)
            .json(errors);
    }

    Post
        .findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avator: req.body.avator,
                user: req.user.id
            }

            post
                .comments
                .unshift(newComment);
            post
                .save()
                .then(post => res.json(post));

        })
        .catch(err => res.status(404).json({msg: "添加评论失败"}));
})

//删除评论

router.delete("/comment/:id/:comment_id", passport.authenticate("jwt", {session: false}), (req, res) => {

    Post.findById(req.params.id).then(post => {

            if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res
                    .status(404)
                    .json({commentNotExist: "该评论不存在"});
            };

            const commentIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);

            post.comments.splice(commentIndex, 1);

            post.save().then(post => res.json(post)).catch(err => res.json({msg: "删除评论失败"}));

        })
        .catch(err => res.status(404).json({msg: "删除评论失败"}));
})

//将router导出
module.exports = router;