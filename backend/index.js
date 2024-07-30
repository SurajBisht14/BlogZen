require('dotenv').config();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const express = require('express');
const app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const moment = require('moment');         //time library

function formatDate() {
  return moment().format('MMMM Do YYYY, h:mm:ss a');
}


app.use(cookieParser());

const { User, Category, Article, Comments } = require('./schema_model.js'); // Importing schema model

// app.use(cors(
//   {
//     origin: 'http://localhost:5173', // Your client URL
//     credentials: true // Allow credentials (cookies) to be sent
//   }
// )); 

app.use(cors({
  origin: 'https://blog-website-mern-blog-zen.vercel.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


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
    let categories = await Category.find().sort({ name: 1 });

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

    // res.cookie('cookieOfUser', token, {
    //   httpOnly: true,
    //   secure: false
    // });
    res.cookie('cookieOfUser', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'None' // Required for cross-site cookie usage
    });

    return res.json(
      {
        msg: "Login successful",
        username: userData.username,
        token: token,
        tokenExpiration: tokenExpiration
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
   filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); 
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
  
    return response
  }
  catch (error) {
  
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

    function changeToUpperCase(word) {
      if (word.length === 0) return word; // handle empty string
      let firstLetter = word[0].toUpperCase();
      let restOfWord = word.slice(1).toLowerCase();
      return firstLetter + restOfWord;
    }

    const { title, category_name, description, content } = req.body;

    let findCategory = await Category.findOne({ name: changeToUpperCase(category_name) });
    const username = await User.findOne({ _id: req.user.id });

    if (!findCategory) {

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
  }
  catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      const combinedMessage = messages.join(', '); // or use a different separator
      return res.status(400).json({ error: combinedMessage });
    }
    return res.status(500).json({ error: `An error occurred: ${error}` });
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

    function changeToUpperCase(word) {
      if (word.length === 0) return word; // handle empty string
      let firstLetter = word[0].toUpperCase();
      let restOfWord = word.slice(1).toLowerCase();
      return firstLetter + restOfWord;
    }

    const { title, category_name, description, content, article_id } = req.body;

    // Find or create the category
    let findCategory = await Category.findOne({ name: changeToUpperCase(category_name) });
    const username = await User.findOne({ _id: req.user.id });

    if (!findCategory) {
      const createCategory = new Category({ name: changeToUpperCase(category_name) });
      await createCategory.save();
      findCategory = createCategory; // Update findCategory with the newly created category
    }

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

    // Get the current article to check its original category
    const currentArticle = await Article.findById(article_id);
    if (!currentArticle) {
      return res.status(404).json({ error: "Blog not found" });
    }
    const originalCategoryName = currentArticle.category_name;

    // Update the article
    const result = await Article.findOneAndUpdate(
      { _id: article_id },
      allArticleData,
      { new: true }
    );

    if (result) {
      // Check if the original category has no articles left
      if (originalCategoryName !== category_name) {
        const originalCategoryCount = await Article.countDocuments({ category_name: originalCategoryName });
        if (originalCategoryCount === 0) {
          await Category.findOneAndDelete({ name: originalCategoryName });
        }
      }

      return res.json({ msg: "Blog updated successfully" });
    } else {
      return res.status(404).json({ error: "Blog not found" });
    }

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      const combinedMessage = messages.join(', '); // or use a different separator
      return res.status(400).json({ error: combinedMessage });
    }
    return res.status(500).json({ error: `An error occurred: ${error}` });
  }
});





// comment section

app.post('/article_comments', auth, async (req, res) => {

  try {
    const { comment, articleId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const postedBy = user.username;
    const posted_on = formatDate();

    const comment_Added = new Comments({ comment, postedBy, articleId, posted_on })

    comment_Added.save();

    res.json({
      msg: "Comment Posted",
      comment: comment_Added
    })

  }
  catch (error) {
    res.json({ error })
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

app.get('/get_myBlogs', auth, async (req, res) => {

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      res.json({
        msg: "user doesn't exists"
      })
    }
    let allBlogs = await Article.find({ author_id: user._id });
    res.json({
      msg: "getMyblogs request came",
      user: user,
      allBlogs: allBlogs
    })
  }
  catch (error) {
    res.json({
      error: error
    })
  }


})

//delete my blog

app.post('/deleteBlog', async (req, res) => {
  try {
    const { articleId } = req.body;

    // Checking if the article exists
    const searchArticle = await Article.findById(articleId);
    if (!searchArticle) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const categoryName = searchArticle.category_name;

    // Get the count of articles in the same category
    const articleCategoryCount = await Article.countDocuments({ category_name: categoryName });

    // Delete the blog
    const deleteBlog = await Article.deleteOne({ _id: articleId });

    if (deleteBlog.deletedCount > 0) {
      // Delete associated comments
      await Comments.deleteMany({ articleId: articleId });

      // Checking if the category needs to be deleted
      if (articleCategoryCount === 1) { // If the only article in that category was the one deleted
        await Category.findOneAndDelete({ name: categoryName });
      }

      res.status(200).json({ msg: 'Blog deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete blog' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the blog' });
  }
});

app.get('/test',(req,res)=>{
    res.json({
      msg:"everything is alright";
    })
})



//logOut

app.get('/logout', (req, res) => {
  res.clearCookie("cookieOfUser");
  res.status(200).json({
    showLogin: true
  });
});



const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
