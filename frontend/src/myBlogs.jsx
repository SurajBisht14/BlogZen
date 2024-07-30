import { useEffect, useState, useRef} from "react";
import { Link } from "react-router-dom";
import loaderImg from './images/loader.svg';
import searchImages from './images/searchImages.jpg';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function MyBlogs() {
    const [myBlogs, setMyBlogs] = useState([]);
    const [Toshow, setToshow] = useState({});
    const [formData, setFormData] = useState({
        blogimg: null,
        title: '',
        category_name: '',
        description: '',
        content: '',
        article_id: '',
        urlToImage: ''
    });

    const noBlogs = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const imagefileinput = useRef(null);
    const [showUpdatebox, setShowUpdatebox] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [changeImage, setChangeImage] = useState(false);
    const [ErrorMsg, setErrorMsg] = useState("");
    const [YesDeletePage,setYesDeletePage]=useState(false)
    const deletingBlogId = useRef("");


    function handleInputChange(event) {
        const { name, value } = event.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    }

    function handleFileChange(event) {
        const file = event.target.files[0];
        setFormData(prevFormData => ({
            ...prevFormData,
            blogimg: file
        }));
        setImagePreview(URL.createObjectURL(file));
    }

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch blogs
                const blogsResponse = await fetch(`${backendUrl}/get_myBlogs`, {
                    method: "GET",
                    credentials: "include",
                });
                const blogsData = await blogsResponse.json();
                setMyBlogs(blogsData.allBlogs.map(blog => ({ ...blog, comments: [] })));

                // Fetch comments for each blog
                const commentsPromises = blogsData.allBlogs.map(blog =>
                    fetch(`${backendUrl}/get_comments`, {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ articleId: blog._id }),
                    })
                        .then(res => res.json())
                        .then(data => ({
                            blogId: blog._id,
                            comments: data.comments || []
                        }))
                );
                const commentsData = await Promise.all(commentsPromises);

                setMyBlogs(prevBlogs =>
                    prevBlogs.map(blog => {
                        const blogComments = commentsData.find(item => item.blogId === blog._id);
                        return blogComments ? { ...blog, comments: blogComments.comments } : blog;
                    })
                );

                if (myBlogs.length === 0) {
                    if (noBlogs.current) {
                        noBlogs.current.style.opacity = '1';
                    }
                } else {
                    if (noBlogs.current) {
                        noBlogs.current.style.opacity = '0';
                    }
                }

            } catch (error) {
                console.error("Error fetching blogs and comments:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [successMsg]);

    async function handleSubmit(event) {
        event.preventDefault();
        let finalFormData;

        if (!formData.article_id) {
            console.error("Article ID is missing");
            return;
        }

        finalFormData = new FormData();
        if (changeImage) {
            finalFormData.append('blogimg', formData.blogimg);
        } else {
            finalFormData.append('urlToImage', formData.urlToImage);
        }

        finalFormData.append('title', formData.title);
        finalFormData.append('category_name', formData.category_name);
        finalFormData.append('description', formData.description);
        finalFormData.append('content', formData.content);
        finalFormData.append('article_id', formData.article_id);

        try {
            setLoading(true);
            const response = await fetch(`${backendUrl}/updateBlog`, {
                method: 'POST',
                credentials: 'include',
                body: finalFormData
            });
            const data = await response.json();

            if (response.ok) {
                setSuccessMsg(data.msg);
                setTimeout(() => setSuccessMsg(''), 2000);
                setFormData({
                    blogimg: null,
                    title: '',
                    category_name: '',
                    description: '',
                    content: '',
                    article_id: '',
                    urlToImage: ''
                });
                setImagePreview(null);
                if (imagefileinput.current) {
                    imagefileinput.current.value = null;
                }
                setShowUpdatebox(false);
                setChangeImage(false);
            }
            else {
                console.log('Server response:', data);
                setErrorMsg(data.error || 'An error occurred');
                setTimeout(() => setErrorMsg(''), 5000);
            }
        } catch (error) {
            console.error("Error submitting blog:", error);
        } finally {
            setLoading(false);
        }
    }

    function toggleEdit(blogId) {
        const blogToEdit = myBlogs.find(blog => blog._id === blogId);
        if (blogToEdit) {
            setFormData({
                blogimg: null,
                title: blogToEdit.title,
                category_name: blogToEdit.category_name,
                description: blogToEdit.description,
                content: blogToEdit.content,
                article_id: blogId,
                urlToImage: blogToEdit.urlToImage
            });
            setShowUpdatebox(true);
        }
    }

    function toggleComments(blogId) {
        setToshow(prevState => ({
            ...prevState,
            [blogId]: !prevState[blogId]
        }));
    }

    async function YesDeletePageFunction(){

        setYesDeletePage(false);

            try {
                setLoading(true);
                const response = await fetch(`${backendUrl}/deleteBlog`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                      },
                    credentials: 'include',
                    body: JSON.stringify({ articleId: deletingBlogId.current})
                });
                const data = await response.json();
                if(response.ok){
                    setSuccessMsg(data.msg)
                    setTimeout(()=>setSuccessMsg(""),1000);
                    deletingBlogId.current="";
                }
                else{
                    setErrorMsg(data.ErrorMsg);
                    setTimeout(()=>setErrorMsg(""),5000);
                    deletingBlogId.current="";
                }
            }
            catch(error){
                        console.log(error)
            }
            finally{
                setLoading(false)
            }
    }

    return (
        <>
            <div className="w-full h-[87vh] overflow-y-scroll relative flex flex-col items-center justify-center">
                {loading && (
                    <div className='h-screen w-screen fixed flex items-center justify-center z-50'>
                        <img src={loaderImg} className='w-[100px]' alt="Loading" />
                    </div>
                )}
                {ErrorMsg.length > 0 &&

                    <p className="text-sm  bg-red-200 py-2 w-full text-red-600 fixed  top-[13vh] z-50 text-center">{ErrorMsg} <span className='absolute right:0 pd-1 md:right-4 text-red-600 hover:cursor-pointer text-[20px] font-extrabold' onClick={() => { setErrorMsg("") }}>&#10005;</span></p>

                }

                {successMsg.length > 0 &&

                    <p className="text-sm  bg-green-200 py-2 w-full text-green-600 fixed  top-[13vh] z-50 text-center">{successMsg} <span className='absolute  right-4 text-green-600 hover:cursor-pointer text-[20px] font-extrabold' onClick={() => { setSuccessMsg("") }}>&#10005;</span></p>

                }

                {YesDeletePage &&
                    <div className="h-screen w-screen bg-[rgba(0,0,0,.9)] z-50  flex items-center justify-center top-0 fixed">
                        <div className="bg-[rgba(255,255,255,.8)]  w-[400px] h-[100px] rounded-lg flex items-center justify-center flex-col  font-serif">
                            <h1 className="text-center text-[20px]">Do you want to delete this post ?</h1>
                            <div className="flex items-center  justify-center mt-4 gap-5 w-full">
                                <button className="bg-indigo-500 hover:bg-indigo-600 rounded-lg w-[20%] p-1 text-white" onClick={() => setYesDeletePage(false)}>No</button>
                                <button className="bg-indigo-500 hover:bg-indigo-600 rounded-lg w-[20%] p-1 text-white" onClick={YesDeletePageFunction}>Yes</button>
                            </div>
                        </div>
                    </div>
                }


                {/* blog update */}
                {showUpdatebox && (
                    <div className="w-full h-full fixed z-20 overflow-y-scroll flex justify-center  bg-[rgba(0,0,0,.6)] backdrop-blur-sm">
                        <div className=" flex flex-col items-center justify-around mt-14  w-[95%] sm:w-[80%] md:w-[60%] lg:w-[40%]  relative">
                            <form onSubmit={handleSubmit} className="px-5 rounded-lg shadow-md w-full pb-16 mt-auto z-10 border" encType="multipart/form-data">
                                <span className="text-white  font-extrabold h-[55px] pr-2 items-center flex justify-end text-[30px] hover:cursor-pointer hover:text-[rgb(61,133,242)]">
                                    <i className="fa-solid fa-xmark" onClick={() => setShowUpdatebox(!showUpdatebox)}></i>
                                </span>
                                <h1 className="text-2xl w-full text-center bg-white text-[rgb(61,133,242)] font-bold mb-4 rounded-lg lg:p-3 font-serif">Update Blog</h1>
                                <label className="block text-white text-sm font-bold pl-2 mt-6 mb-3 relative">
                                    Image
                                    <span className="font-thin rounded-md p-1 bottom-0 bg-[rgb(61,133,242)] absolute right-0 hover:cursor-pointer" onClick={() => setChangeImage(!changeImage)}>Change Image</span>
                                </label>
                                <div className="mb-4 relative h-[300px]">
                                    {changeImage ? (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                name="blogimg"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 w-full h-full z-10 cursor-pointer"
                                                required
                                                ref={imagefileinput}
                                            />
                                            {!imagePreview && (
                                                <div className="absolute inset-0 flex items-center justify-center text-white font-bold border z-0 rounded-lg overflow-hidden">
                                                    Choose File or drag file here
                                                </div>
                                            )}
                                            {imagePreview && (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                            )}
                                        </>
                                    ) : (
                                        <img
                                            src={formData.urlToImage || searchImages}
                                            alt="Blog Image"
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    )}
                                </div>
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Title"
                                        className="w-full px-4 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        name="category_name"
                                        value={formData.category_name}
                                        onChange={handleInputChange}
                                        placeholder="Category"
                                        className="w-full px-4 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Description"
                                        className="w-full px-4 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div className="relative mb-4">
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        placeholder="Content"
                                        className="w-full px-4 py-2 border rounded-md"
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>
                                <input type="hidden" name="article_id" value={formData.article_id} />
                                <div className="flex justify-center">
                                    <button type="submit" className="bg-blue-500 text-white  w-full text-center px-6 py-2 rounded-md hover:bg-blue-600">Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* no blogs message */}


                {
                    myBlogs.length === 0 ? (
                        <div className="h-full w-full flex items-center justify-center opacity-0" ref={noBlogs}>
                            <div className="flex flex-col items-center mt-auto lg:mt-0 px-2 lg:flex-row">
                                <div>
                                    <div className="ml-5 lg:ml-0">
                                        <h1 className="mt-3 text-2xl font-semibold text-gray-800 md:text-3xl">
                                            Oops, no blogs are posted yet.
                                        </h1>
                                        <p className="mt-4 text-gray-500">
                                            You haven't created any blogs yet, click the button below to create one.
                                        </p>
                                        <div className="mt-6 flex items-center gap-x-3">
                                            <Link to="/">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-black px-3 py-2 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                                >
                                                    Read blogs
                                                </button>
                                            </Link>
                                            <Link to="/createBlogs">
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                                >
                                                    Create Blogs
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="mt-10 space-y-6 ml-5 lg:ml-0">
                                        <div>
                                            <a
                                                href="#"
                                                className="hover:underline inline-flex items-center gap-x-2 text-sm font-semibold text-black"
                                            >
                                                <span>Learn something new</span>
                                            </a>
                                            <p className="mt-2 text-sm text-gray-500">Dive into our blogs to learn more.</p>
                                        </div>
                                        <div>
                                            <a
                                                href="#"
                                                className="inline-flex items-center gap-x-2 text-sm font-semibold text-black hover:underline"
                                            >
                                                <span>Our blog</span>
                                            </a>
                                            <p className="mt-2 text-sm text-gray-500">Read the latest posts on our blog.</p>
                                        </div>
                                        <div>
                                            <a
                                                href="#"
                                                className="inline-flex items-center gap-x-2 text-sm font-semibold text-black hover:underline"
                                            >
                                                <span>Chat</span>
                                            </a>
                                            <p className="mt-2 text-sm text-gray-500">Comment on different posts.</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <img
                                        src={searchImages}
                                        alt="404"
                                        className="h-full w-[300px] lg:w-[400px] rounded-md object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full w-full flex  flex-col  items-center overflow-y-auto">
                            <h1 className="font-bold text-[25px] pt-6 text-center">Total Blogs - {myBlogs.length}</h1>
                            {myBlogs.map(blog => (
                                <div key={blog._id} className="p-4 mb-4 border w-[95%] sm:w-[500px] mt-5 rounded-lg shadow-md">
                                    <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
                                    <p className="mb-2">{blog.description}</p>
                                    <img src={blog.urlToImage || searchImages} alt={blog.title} className="w-full h-[200px] sm:h-[300px] rounded-md mb-2" />

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                        <button onClick={() => toggleEdit(blog._id)} className="w-full sm:w-auto bg-blue-500 hover:bg-green-500 text-white px-4 py-2 rounded-md">Edit</button>
                                        <button onClick={() => toggleComments(blog._id)} className="w-full sm:w-auto bg-blue-500 hover:bg-green-500 text-white  px-4 py-2 rounded-md">
                                            {Toshow[blog._id] ? 'Hide Comments' : 'Show Comments'}
                                        </button>
                                        <Link className="w-full hover:bg-green-500 sm:w-auto text-center bg-blue-500 text-white px-4 py-2  rounded-md cursor-pointer" to='/blogInfo' key={blog._id} state={{ article: blog }}>
                                            Read more
                                        </Link>
                                        <button className="w-full hover:bg-green-500 sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-md" 
                                        onClick={()=>{
                                            setYesDeletePage(true)
                                             deletingBlogId.current=blog._id;
                                            }}
                                        >
                                            Delete Post
                                        </button>
                                    </div>

                                    {Toshow[blog._id] && (
                                        <div className='border mt-2 rounded-md'>
                                            <div className='w-full mt-2'>
                                                <h1 className="text-center font-bold">Comments</h1>
                                                {blog.comments.length === 0 ? (
                                                    <div className='mx-auto w-[80%] h-[200px] flex items-center justify-center'>
                                                        <span className='text-gray-400 text-[20px]'>No comments yet</span>
                                                    </div>
                                                ) : (
                                                    blog.comments.map((comment, key) => (
                                                        <div key={key} className='w-full mt-2'>
                                                            <div className='mx-auto w-[100%] border-b'>
                                                                <div className="px-3 mt-2">
                                                                    <h1 className='font-bold text-sm'>{comment.postedBy}</h1>
                                                                    <h1 className='text-sm'>{comment.posted_on}</h1>
                                                                    <p className='text-sm pt-2 pb-4'>{comment.comment}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>
        </>
    );
}

export default MyBlogs;