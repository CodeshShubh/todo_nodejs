import mongoose from "mongoose";
const Schema = mongoose.Schema;


const signupSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true

    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true});


const Signup = mongoose.model('Signup', signupSchema)
export default Signup