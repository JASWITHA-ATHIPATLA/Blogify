const mongoose=require('mongoose')
const {createHmac, timingSafeEqual}=require('node:crypto');
const crypto = require('crypto');
const userSchema=mongoose.Schema({
    Fullname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    profileImageURL:{
        type:String,
        default:'/images/default.png',
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    }
    
},{timestamps:true});

userSchema.pre('save',async function (){
    const user=this;
    if(!user.isModified("password"))return;
    const salt=crypto.randomBytes(15).toString();
    const hashedPassword=createHmac("sha256",salt).update(user.password).digest('hex');
    this.salt=salt;
    this.password = hashedPassword;
})

function verifyPassword(inputPassword,salt,hashedPassword){
    const submittedHash = createHmac('sha256', salt)
        .update(inputPassword)
        .digest()
    const storedHash = Buffer.from(hashedPassword, 'hex')

    return storedHash.length === submittedHash.length &&
        timingSafeEqual(storedHash, submittedHash)
}

const User=mongoose.model("user",userSchema);

module.exports={
    User,
    verifyPassword,
};