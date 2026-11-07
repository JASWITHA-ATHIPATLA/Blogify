require('dotenv').config();
const express=require('express');
const userRouter=require('./routes/user.js');
const cors=require('cors')
const app=express();
const mongoose=require('mongoose');
const cookieParser=require('cookie-parser');
const path=require('node:path');
const blogRouter=require('./routes/blog.js');


app.use(cookieParser());
app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.set('view engine','ejs');
app.use('/user',userRouter);
app.use('/blog',blogRouter);

async function startServer() {
  await mongoose.connect('mongodb://localhost:27017/User')

  const port = process.env.PORT || 3003
  app.listen(port, () => {
    console.log(`Server at http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to connect to MongoDB:', error)
  process.exit(1)
})