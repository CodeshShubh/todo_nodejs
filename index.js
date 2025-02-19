import express from 'express';
import mongoose from 'mongoose';
import Todos from './modal.js';

const app = express();
const PORT=8000;
// const URI ='mongodb+srv://shubhanshusaadhiyaan:rdec@cluster0.ojpi4af.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect('mongodb://localhost:27017').then(()=>{
    console.log(`Database is connected..`)
}).catch((err)=>{
    console.log(`there is error in link other error like ->`, err)
})



app.use(express.json())


app.post('/api/todo',(req,res)=>{
    const {text} = req.body
    // console.log(text)
     if(!text){
       return res.status(400).json({error: "Text is required "})
     }
     const newTodo = new Todos({
        text : text
     })

     newTodo.save().then((item)=>{

        res.status(201).json({Message: "Todo added Succesfully" , item})
     }).catch((error)=>{
        res
        .status(500)
        .json({ Error: "Error while creating please try again", error });
     })
    
})



app.get('/api/todos', async(req,res)=>{
    try{
     const todos = await Todos.find();
    //  console.log(todos)
     res.status(200).json({Success: "Fetched All todos", todos})
    
    }catch(err){
        res.status(500).json({ Error: "Error while find please try again", err });
    }
   
})


app.get('/api/todo/:id', async(req,res)=>{
    try{
        const todoId = req.params.id;
        const todo = await Todos.findById(todoId) // OR Todos.findOne({_id:todoId})
        // console.log(todo)
        if(!todo) 
            return res.status(404).json({error: 'Todo not found'})

        res.status(200).json({Success:'todo found Succesfully', todo})

    }catch(err){
         res.status(500).json({Error: 'server error while finding one todo', reason: err})
    }
})

app.delete('/api/todo/:id', async(req,res)=>{
   try{
    const userId = req.params.id;

    const deletedUser = await Todos.findOneAndDelete(userId);

    if(!userId)
        return res.status(404).json({Error:` user not found`})

    res.status(200).json({Success: `user deleted seccesfully`, userId:deletedUser})


   }catch(err){
    res.status(500).json({Error: 'server error while deleting one todo', reason: err})

   }
})




app.put('/api/todo/:id', async (req, res) => {
    try {
      const todoId = req.params.id;
      const { text } = req.body;
  
      // Validation: Check if text is provided
      if (!text) {
        return res.status(400).json({ error: "Text is required for updating" });
      }
  
      // Find and update the todo
      const updatedTodo = await Todos.findOneAndUpdate(
        { _id: todoId }, // Find by ID
        { text: text }, // Update field
        { new: true }   // Return the updated document
      );
  
      // Check if todo exists
      if (!updatedTodo) {
        return res.status(404).json({ error: "Todo not found" });
      }
  
      return res.status(200).json({ message: "Todo updated successfully", updatedTodo });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error while updating todo" });
    }
  });
  










app.listen(PORT, ()=>{
    console.log(`Node js server is running...`)
})