const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Registration schema 
const registrationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: {
         type: String,
         required: true,
         minlength: [3 , 'Username must be atleast 3 characters long'],  
        },
    password: { 
        type: String,
         minlength : [8 , 'Password must be atleast 8 characters long'],
         required: true },
});

//Categories schema

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    order: { type: Number }
  });
const Category = mongoose.model('Category', categorySchema);  //we have make a category collection 


//Articles schema 

const articleSchema = new mongoose.Schema({
    author: { type: String },
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author ID is required'] // Ensure this is provided
    },
    title: { 
        type: String, 
        required: [true, 'Title is required'] 
    },
    urlToImage: { type: String },
    publishedAt: { type: String },
 
    description: { 
        type: String, 
        minlength: [10, 'Description must be at least 5 characters long'], 
        maxlength: [150, 'Description cannot exceed 150 characters'] 
    },
    content: { 
        type: String, 
        minlength: [10, 'Description must be at least 5 characters long'], 
        minlength: [20, 'Content must be at least 20 characters long'] 
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: [true, 'Category is required'] 
    },
    category_name: {
        type: String,
        default: ""
    },
    url: {
        type: String,
        unique: true,
        sparse: true // This ensures that null values are ignored for the unique constraint
    }
});




  const Article = mongoose.model('Article', articleSchema);



  const commentSchema = new mongoose.Schema({

        comment : {
            type : String,
            required : true
        },
        postedBy :{
            type : String,
            required : true
        },
        articleId : { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Article', 
            required: true 
        },
        posted_on :{
            type : String,
            required : true
        }

  })
  
  const Comments = mongoose.model("Comments",commentSchema)
  

// Pre-save hook to hash the password
registrationSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        next();
    } catch (error) {
        console.log("Error while hashing password:", error);
        next(error);
    }
});

const User = mongoose.model('User', registrationSchema);

module.exports = {User,Category,Article,Comments};

