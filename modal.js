import mongoose from "mongoose";
const schema = mongoose.Schema;

const todoSchema = new schema({
    text: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // ✅ Linking todo to a user
        ref: "Signup",
        required: true,
    }
}, { timestamps: true });

const Todos = mongoose.model('Todos', todoSchema);
export default Todos;
