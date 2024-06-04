const express = require('express');
const zod = require('zod');
const { User, Account } = require('../db');
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const { authMiddleware } = require('../middleware');
const router = express.Router();

const signupSchema = zod.object({
    userName: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName:zod.string()
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName:zod.string().optional(),
    lastName: zod.string().optional(),
})

router.post("/signup", async(req,res) =>{
    const body = req.body;
    const {success} = signupSchema.safeParse(req.body);
    if(!success){
        return res.json({
            message:"Email already taken/  Incorrect inputs"
        })
    }

    const existingUser = User.findOne({
        userName: body.userName
    })
    if(existingUser._id){
        return res.json({
            message:"Email already taken/  Incorrect inputs"
        })
    }

    const dbUser = await User.create(body);
    const userId = dbUser._id;

    await Account.create({
        userId,
        balance: 1+Math.random() * 10000
    })
    const token = jwt.sign({
        userId : dbUser._id
    }, JWT_SECRET)
    res.json({
        message:"user created successfully",
        token:token
    })
})
const signinBody = zod.object({
    userName: zod.string().email(),
	password: zod.string()
})

router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const user = await User.findOne({
        userName: req.body.userName,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
        return;
    }

    
    res.status(411).json({
        message: "Error while logging in"
    })
})


router.put("/", authMiddleware, async(req,res)=>{
    const {success} = updateBody.safeParse(req.body);
    if(!success) {
        res.status(411).json({
            message:"Error while updating information"
        })
    }
    await User.updateOne({ _id:req.userId}, req.body);
    res.json({
        message:"Updated successfully"
    })
})

router.get("/bulk",authMiddleware,async(req, res) =>{
    const filter = req.query.filter || "";
    const users = await User.find({
        $or:[{
            firstName:{
                "$regex":filter
            }
        },{
            lastName: {
                "$regex": filter
            }
        }]
    })
    console.log("22222222",users,req.userId)
    const filteredUsers = users.filter(user => user._id.toString() !== req.userId);

    res.json({
        user: filteredUsers.map(user => ({
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
})
module.exports = router;