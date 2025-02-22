import express from 'express';
import mongoose from 'mongoose';
import Todos from './modal.js';
import Signup from './signupModal.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ejs from 'ejs'

const app = express();
const PORT = 8000;
const JWT_SECRET = 'shubhanshu_saadhiyaan'; // Replace with a strong secret

mongoose.connect('mongodb://localhost:27017/todosDB').then(() => {
    console.log(`Database connected..`);
}).catch((err) => {
    console.log(`Error in DB connection ->`, err);
});



// Middleware
app.use(express.json());

// this is setup for ejs
app.set('view engine', 'ejs');
app.get('/', (req,res)=>{
  res.render('index')
})

app.get('/home',(req,res)=>{
  res.render('home')
})



// ✅ **Middleware: Auth Validator (JWT)**
const validator = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) 
            return res.status(401).json({ status: 'Failure', message: 'Unauthorized. Please login' });

        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; // Attach user ID to request
        next();
    } catch (error) {
        return res.status(401).json({ status: 'Failure', message: 'Invalid Token' });
    }
};




// ✅ **Signup API**
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: 'Please enter all fields' });

        const existUser = await Signup.findOne({ email });
        if (existUser)
            return res.status(400).json({ error: 'User already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new Signup({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});




// ✅ **Login API (JWT Token)**
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Please enter all fields' });

        const user = await Signup.findOne({ email });
        if (!user)
            return res.status(400).json({ error: 'User not found' });

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
            return res.status(400).json({ error: 'Invalid credentials' });

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});




// ✅ **Create Todo (Only Logged-in User)**
app.post('/api/todo', validator, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text)
            return res.status(400).json({ error: "Text is required" });

        const newTodo = new Todos({ text, userId: req.userId });
        await newTodo.save();

        res.status(201).json({ message: "Todo added successfully", newTodo });
    } catch (error) {
        res.status(500).json({ error: "Error while creating todo", error });
    }
});




// ✅ **Fetch Todos (Only Todos Created by the Logged-in User)**
app.get('/api/todos', validator, async (req, res) => {
    try {
        const todos = await Todos.find({ userId: req.userId });
        res.status(200).json({ message: "Fetched user todos", todos });
    } catch (error) {
        res.status(500).json({ error: "Error while fetching todos", error });
    }
});




// ✅ **Fetch a Single Todo (Only if Belongs to the Logged-in User)**
app.get('/api/todo/:id', validator, async (req, res) => {
    try {
        const todo = await Todos.findOne({ _id: req.params.id, userId: req.userId });
        if (!todo)
            return res.status(404).json({ error: "Todo not found" });

        res.status(200).json({ message: "Todo found", todo });
    } catch (error) {
        res.status(500).json({ error: "Error while fetching todo", error });
    }
});



// ✅ **Update Todo (Only if Belongs to the Logged-in User)**
app.put('/api/todo/:id', validator, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text)
            return res.status(400).json({ error: "Text is required for updating" });

        const updatedTodo = await Todos.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { text },
            { new: true }
        );

        if (!updatedTodo)
            return res.status(404).json({ error: "Todo not found" });

        res.status(200).json({ message: "Todo updated successfully", updatedTodo });
    } catch (error) {
        res.status(500).json({ error: "Server error while updating todo", error });
    }
});




// ✅ **Delete Todo (Only if Belongs to the Logged-in User)**
app.delete('/api/todo/:id', validator, async (req, res) => {
    try {
        const deletedTodo = await Todos.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!deletedTodo)
            return res.status(404).json({ error: "Todo not found" });

        res.status(200).json({ message: "Todo deleted successfully", deletedTodo });
    } catch (error) {
        res.status(500).json({ error: "Server error while deleting todo", error });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
