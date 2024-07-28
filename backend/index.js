require('dotenv').config();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const express = require('express');
const app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const moment = require('moment');         //time library

function formatDate() {
  return moment().format('MMMM Do YYYY, h:mm:ss a');
}


app.use(cookieParser());

const { User, Category, Article, Comments } = require('./schema_model.js'); // Importing schema model

app.use(cors(
  {
    origin: 'http://localhost:5173', // Your client URL
    credentials: true // Allow credentials (cookies) to be sent
  }
)); // Using CORS

// Middleware to parse URL-encoded data and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const connectDb = require('./database.js'); // Importing database connection file
connectDb()
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });


//user authentication
const auth = (req, res, next) => {

  const token = req.cookies.cookieOfUser;

  if (!token) {
    return res.status(401).json({ error: "Please Login" });
  }

  try {
    const verifyUser = jwt.verify(token, process.env.SECRET_CODE);
    req.user = verifyUser;  // Attach the decoded user info to the request
    next();
  }
  catch (error) {
    return res.status(401).json({ error: "Invalid User" });
  }
}


// Home 
app.post('/', async (req, res) => {

  const { blogName } = req.body;
  try {

    if (blogName === "All") {
      let relatedBlogData = await Article.find();
      let categories = await Category.find().sort({ name: 1 });
      return res.json({
        msg: 'Given Category Data',
        articles: relatedBlogData,
        name: categories,
      });
    }

    let relatedBlogData = await Category.findOne({ name: blogName });

    // If the related blog category is not found
    if (!relatedBlogData) {
      return res.status(404).json({ msg: `Sorry no blogs are found for ${blogName}` });
    }

    // Find articles related to the blog category
    let articleData = await Article.find({ category: relatedBlogData._id });
    let categories = await Category.find().sort({ name : 1 });

    // Send the response with the related blog and article data
    return res.json({
      msg: 'Given Category Data',
      articles: articleData,
      name: categories,
    });
  }
  catch (error) {
    console.error('Error while getting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Signup 
app.post('/signup', async (req, res) => {
  const { email, username, password, confirmPassword } = req.body;
  console.log(email, username, password, confirmPassword);

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create a new user instance
    const newUser = new User({ email, username, password });
    await newUser.save();

    // Send a success response
    return res.status(201).json({
      msg: "Sign Up Successfull",
    });
  }
  catch (error) {
    console.error("Error during signup:", error);
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});



app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    let comparedPassword = await bcrypt.compare(password, userData.password);

    if (!comparedPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    let token = jwt.sign({ id: userData._id }, process.env.SECRET_CODE, { expiresIn: '3h' });
    let tokenExpiration = new Date().getTime() + 3 * 60 * 60 * 1000; // 3 hours from now

    res.cookie('cookieOfUser', token, {
      httpOnly: true,
      secure: false
    });

    return res.json(
      {
        msg: "Login successful",
        username : userData.username,
        token : token,
        tokenExpiration : tokenExpiration
      }
    );
  }
  catch (error) {
    console.error("Error during Login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
})


//Create Blog Section


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images');  // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);  // Adding a unique timestamp
  }
});
const upload = multer({ storage: storage });


cloudinary.config({
  cloud_name: process.env.API_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET_KEY
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("could not find the path")
      return null
    }
    let response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    fs.unlinkSync(localFilePath);
    return response
  }
  catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("can't upload file", error)
    return null

  }
}


app.post('/createBlog', auth, upload.single("blogimg"), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult) {
      return res.status(500).json({ msg: 'Failed to upload image' });
    }
    const { title, category_name, description, content } = req.body;

    let findCategory = await Category.findOne({ name: category_name });
    const username = await User.findOne({ _id: req.user.id });

    if (!findCategory) {
      function changeToUpperCase(word) {
        if (word.length === 0) return word; // handle empty string
        let firstLetter = word[0].toUpperCase();
        let restOfWord = word.slice(1).toLowerCase();
        return firstLetter + restOfWord;
      }
      const createCategory = new Category({ name: changeToUpperCase(category_name) });
      await createCategory.save();
      findCategory = createCategory; // Update findCategory with the newly created category
    }

    const allArticleData = {
      author: username.username,
      author_id: req.user.id,
      title: title,
      urlToImage: uploadResult.secure_url,
      publishedAt: formatDate(),
      description: description,
      content: content,
      category: findCategory._id,
      category_name: findCategory.name
    };

    const articleExist = await Article.findOne({ description, content });
    if (articleExist) {
      return res.status(400).json({ error: "Blog can't be created because the blog already exists" });
    } else {
      const createnewArticle = new Article(allArticleData);
      await createnewArticle.save();
      return res.status(200).json({ msg: "Blog created successfully" });
    }
  } catch (err) {
    return res.status(500).json({ error: `An error occurred: ${err}` });
  }
});

  app.post('/updateBlog', auth, upload.single("blogimg"), async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
  
    try {
      let imageUrl;
      if (req.file) {
        // Only if a file is included in the request, upload it to Cloudinary
        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (!uploadResult) {
          return res.status(500).json({ msg: 'Failed to upload image' });
        }
        imageUrl = uploadResult.secure_url;
      }
  
      const { title, category_name, description, content, article_id } = req.body;

  
      const findCategory = await Category.findOne({ name: category_name });
      const username = await User.findOne({ _id: req.user.id });
  
      const allArticleData = {
        author: username.username,
        author_id: req.user.id,
        title: title,
        publishedAt: formatDate(),
        description: description,
        content: content,
        category: findCategory._id,
        category_name: findCategory.name
      };
  
      // Only include urlToImage if a new image was uploaded
      if (imageUrl) {
        allArticleData.urlToImage = imageUrl;
      }
  
      const result = await Article.findOneAndUpdate(
        { _id: article_id },
        allArticleData,
        { new: true }
      );
  
      if (result) {
        res.json({ msg: "Blog updated successfully" });
      } else {
        res.status(404).json({ msg: "Blog not found" });
      }
  
    } catch (err) {
      return res.status(500).json({ error: `An error occurred: ${err.message}` });
    }
  });
  
  





// comment section

app.post('/article_comments',auth,async (req, res) => {
 
  try{
    const { comment, articleId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const postedBy = user.username;
    const posted_on = formatDate();    

    const comment_Added = new Comments({comment,postedBy, articleId,posted_on})

    comment_Added.save();

    res.json({
      msg:"Comment Posted",
      comment : comment_Added
    })

  }
  catch(error){
    res.json({error})
  }
}
)

app.post('/get_comments', async (req, res) => {
  try {
      const { articleId } = req.body;

      const commentData = await Comments.find({ articleId });

      if (commentData.length === 0) {
          res.status(200).json({ msg: "No comments yet" });
      } else {
          res.status(200).json({
              msg: "All comments are these",
              comments: commentData
          });
      }
  } catch (error) {
      res.status(500).json({ msg: "Some error occurred while fetching comments" });
  }
});


//getting my blogs

app.get('/get_myBlogs',auth,async (req,res)=>{

  try{
    let user = await User.findById(req.user.id);
    if(!user){
      res.json({
        msg:"user doesn't exists"
      })
    }
    let allBlogs = await Article.find({author_id : user._id});
    res.json({
      msg: "getMyblogs request came",
      user : user,
      allBlogs : allBlogs
    })
  }
  catch(error){
    res.json({
      error: error
    })
  }
   

})


//logOut

app.get('/logout', (req, res) => {
  res.clearCookie("cookieOfUser");
  res.status(200).json({
    showLogin: true
  });
});



app.listen(7000, () => {
  console.log("Express server is running on port 7000");
});
