import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

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
        urlToImage:''
    });

    const noBlogs = useRef(null)

    const [imagePreview, setImagePreview] = useState(null);
    const imagefileinput = useRef(null);
    const [showUpdatebox, setShowUpdatebox] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [changeImage, setchangeImage] = useState(false);

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
        checkForMyBlogs();
    }, [successMsg]);

    async function checkForMyBlogs() {
        try {
            setLoading(true)
            let fetchServer = await fetch("http://localhost:7000/get_myBlogs", {
                method: "GET",
                credentials: "include",
            });
            let data = await fetchServer.json();
            setMyBlogs(data.allBlogs.map(blog => ({ ...blog, comments: [] })));

            // Fetch comments for each blog
            for (let blog of data.allBlogs) {
                await fetchComments(blog._id);
            }
            if(myBlogs.length===0){
                if(noBlogs.current){
                    noBlogs.current.style.opacity='1';
                }
            }
            else{
                if(noBlogs.current){
                    noBlogs.current.style.opacity='0';
                }
            }
            setLoading(false)
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchComments(blogId) {
        try {
            setLoading(true)
            const fetchData = await fetch("http://localhost:7000/get_comments", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ articleId: blogId }),
            });

            const data2 = await fetchData.json();
            setMyBlogs(prevBlogs => prevBlogs.map(blog =>
                blog._id === blogId ? { ...blog, comments: data2.comments || [] } : blog
            ));
            setLoading(false)
        } catch (error) {
            console.log(error);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        let finalFormData;

        if (!formData.article_id) {
            console.error("Article ID is missing");
            return;
        }

        if (changeImage) {
            finalFormData = new FormData();
            finalFormData.append('blogimg', formData.blogimg);
        } else {
            finalFormData = new FormData();
            finalFormData.append('urlToImage', formData.urlToImage);
        }

        finalFormData.append('title', formData.title);
        finalFormData.append('category_name', formData.category_name);
        finalFormData.append('description', formData.description);
        finalFormData.append('content', formData.content);
        finalFormData.append('article_id', formData.article_id);

        try {
            setLoading(true);
            let fetchedData = await fetch('http://localhost:7000/updateBlog', {
                method: 'POST',
                credentials: 'include',
                body: finalFormData
            });
            let data = await fetchedData.json();

            if (fetchedData.ok) {


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
                setLoading(false);
                setShowUpdatebox(false); // Hide the update box after submission
                if(changeImage){
                    window.location.reload();
                } 
                else{
                    setchangeImage(false);
                }
                

               
            } else {
                console.error("Some error occurred", data);
            }
        } catch (error) {
            console.error("Error submitting blog:", error);
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
                urlToImage : blogToEdit.urlToImage
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

    return (
        <>
            <div className="w-full h-[87vh] overflow-y-scroll relative">


                {
                    loading &&
                    <div className='h-screen w-screen fixed flex items-center justify-center z-50'>
                        <img src="/src/images/loader.svg" className='w-[100px]' alt="Loading" />
                    </div>
                }

                {successMsg && <div className='fixed z-20 transition-all top-[13vh] bg-green-200 text-green-600 border-2 border-green-600 w-full font-bold h-[5%] p-5 flex items-center justify-center font-serif text-[25px]'>{successMsg}</div>}


                {/* blog update */}

                {
                    showUpdatebox &&
                    <div className="w-full  h-full fixed  z-20 overflow-y-scroll flex  justify-center bg-[rgba(0,0,0,.6)] backdrop-blur-sm">

                        <div className="h-[90%] w-[95%] sm:w-[80%] md:w-[60%] lg:w-[40%] relative">

                            <form onSubmit={handleSubmit} className="px-5 rounded-lg shadow-md w-full pb-32 mt-auto  z-10   border"  encType="multipart/form-data">
                                <span className="text-white font-extrabold h-[55px]  pr-2 items-center flex justify-end  text-[30px] hover:cursor-pointer hover:text-[rgb(61,133,242)]"><i className="fa-solid fa-xmark" onClick={() => { setShowUpdatebox(!showUpdatebox) }}></i></span>
                                <h1 className="text-2xl w-full text-center bg-white text-[rgb(61,133,242)] font-bold mb-4 rounded-lg lg:p-3 font-serif ">Update Blog</h1>


                                <label className="block text-white text-sm font-bold pl-2  mt-6 mb-3 relative">Image
                                    <span className="font-thin rounded-md p-1 bottom-0 bg-[rgb(61,133,242)] absolute right-0 hover:cursor-pointer" onClick={() => setchangeImage(!changeImage)}>Change Image</span></label>
                                <div className="mb-4 relative h-[300px]">

                                    {
                                        changeImage ? (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    name="blogimg"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 opacity-0 w-full h-full z-10 cursor-pointer "
                                                    required
                                                    ref={imagefileinput}
                                                />
                                                {!imagePreview && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold border z-0 rounded-lg overflow-hidden">
                                                        Choose File or drag file here
                                                    </div>
                                                )}
                                                {imagePreview && (
                                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-center rounded-lg border" />
                                                )}
                                            </>
                                        ) : (
                                            <img src={formData.urlToImage} className="w-full h-full"/>
                                        )
                                    }
                                </div>


                                <div className="mb-4">
                                    <label className="block text-white text-sm font-bold mb-2">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter blog title"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-white text-sm font-bold mb-2">Category</label>
                                    <input
                                        type="text"
                                        name="category_name"
                                        value={formData.category_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter blog category eg. Tech, Food, Health"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-white text-sm font-bold mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter blog description"
                                        rows="3"
                                        required
                                    ></textarea>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-white text-sm font-bold mb-2">Content</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter blog content"
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-[rgb(61,133,242)] w-full text-center text-white px-4 py-3 rounded hover:bg-[rgba(61,133,242,.9)] focus:outline-none "
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                }

                {myBlogs.length === 0 ? (
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
                                    src="/src/images/searchImages.jpg"
                                    alt="404"
                                    className="h-full w-[300px] lg:w-[400px] rounded-md object-cover"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full w-full flex justify-center">
                        <div>
                            <h1 className="font-bold text-[25px] mt-2 text-center">Total Blogs - {myBlogs.length}</h1>
                            {myBlogs.map((e,i) => (
                                      
                                <div key={e._id} className="w-[98%] mx-auto sm:w-[450px] mt-5 rounded-md border shadow-md ">
                                    <img
                                        src={e.urlToImage}
                                        alt="Blog Image"
                                        className="h-[200px] w-full rounded-md md:object-cover "
                                    />
                                    <div className="p-4">
                                        <h1 className="text-sm font-semibold">Title - {e.title}</h1>
                                        <h1 className="text-sm font-semibold">Description - {e.description}</h1>
                                        
                                      
                                         <p className="mt-3 text-sm text-gray-600">{e.content} 
                                             <Link to='/blogInfo' className="font-bold cursor-pointer" key={i} state={{ article: e }}>read more</Link>
                                        </p>
                                         

                                        {/* Comment section */}
                                        {
                                            Toshow[e._id] &&
                                            <div className='border mt-2 rounded-md'>
                                                <div className='w-full mt-2'>
                                                    <h1 className="text-center font-bold">Comments</h1>
                                                    {
                                                        e.comments.length === 0 ? (
                                                            <div className='mx-auto w-[80%] h-[200px]  flex items-center justify-center'>
                                                                <span className='text-gray-400 text-[20px]'>No comments yet</span>
                                                            </div>
                                                        ) : (
                                                            e.comments.map((comment, key) => (
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
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        }
                                        <button
                                            type="button"
                                            className="mt-4 rounded-md bg-black px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                            onClick={() => toggleEdit(e._id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-4 ml-4 rounded-md bg-black px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                            onClick={() => toggleComments(e._id)}
                                        >
                                            Comments
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default MyBlogs;


