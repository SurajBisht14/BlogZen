import { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from './App.jsx';
import img from '/src/images/createBg.jpg'

function Blogs() {
    const [formData, setFormData] = useState({
        blogimg: null,
        title: '',
        category_name: '',
        description: '',
        content: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const { authState, setAuthState } = useContext(MyContext);
    const imagefileinput = useRef(null);

    function handleInputChange(event) {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }



    function handleFileChange(event) {
        const file = event.target.files[0];
        setFormData({
            ...formData,
            blogimg: file
        });
        setImagePreview(URL.createObjectURL(file));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const finalFormData = new FormData();
        finalFormData.append('blogimg', formData.blogimg);
        finalFormData.append('title', formData.title);
        finalFormData.append('category_name', formData.category_name);
        finalFormData.append('description', formData.description);
        finalFormData.append('content', formData.content);

        try {
            setLoading(true);
            let fetchedData = await fetch('http://localhost:7000/createBlog', {
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
                    content: ''
                });
                setImagePreview(null);
                imagefileinput.current.value = null;
            } else {
                console.error("Some error occurred", data);
            }
        } catch (error) {
            console.error("Error submitting blog:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            id="bgMain"
            style={{ backgroundImage: `url(${img})` }}
            className="bg-center bg-cover bg-no-repeat flex justify-center items-center w-screen h-[87vh] overflow-y-scroll"
        >


            {
                loading &&
                <div className='h-screen w-screen fixed flex items-center justify-center z-50'>
                    <img src="/src/images/loader.svg" className='w-[100px]' alt="Loading" />
                </div>
            }
            {successMsg && <div className='fixed z-20 transition-all top-[13vh] bg-green-200 text-green-600 border-2 border-green-600 w-full font-bold h-[5%] p-5 flex items-center justify-center font-serif text-[25px]'>{successMsg}</div>}

            {authState.isAuth ? (

                <form onSubmit={handleSubmit} className="p-6 rounded-lg shadow-md w-[95%] md:w-[50%]  m-auto mb-[3%] z-10  backdrop-blur-sm border" encType="multipart/form-data">
                    <h1 className="text-2xl w-full text-center bg-[rgb(61,133,242)] text-white font-bold mb-4 rounded-lg p-3 font-serif ">Create New Blog</h1>


                    <label className="block text-white text-sm font-bold pl-2 mb-2">Image</label>
                    <div className="mb-4 relative h-[300px]">

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
                            className="bg-[rgb(61,133,242)] text-white px-4 py-2 rounded hover:bg-[rgba(61,133,242,.9)] focus:outline-none "
                        >
                            Create Blog
                        </button>
                    </div>
                </form>
            ) : (

                <div className="h-full w-full  flex items-center justify-center ">
                    <div className=" lg:ml-11 mt-auto lg:mt-0 flex flex-col w-full lg:w-auto  items-center px-2 lg:flex-row backdrop-blur-[5px] rounded-lg sm:border-2">
                        <div>
                            <div className="lg:ml-0 text-cetner">

                                <h1 className="mt-3 text-2xl font-semibold text-white pb-2 pl-2 rounded-md bg-black md:text-3xl">
                                    Opps , you are not logged in.
                                </h1>
                                <p className="mt-4 text-white">
                                    To create blogs please login first , click below button to login .
                                </p>
                                <div className="mt-6  flex items-center gap-x-3">
                                    <Link to='/'>
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border   px-3 py-2 text-sm font-semibold text-white  shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                        >
                                            Read blogs
                                        </button>
                                    </Link>
                                    <Link to='/login'>
                                        <button
                                            type="button"
                                            className="rounded-md bg-black border px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                        >
                                            Login
                                        </button>
                                    </Link>

                                </div>
                            </div>
                            <div className="mt-10 space-y-6  lg:ml-0">
                                <div>

                                    <span className='text-black font-bold' > &#8226; Learn something new</span>


                                    <p className="mt-2 text-sm text-white pl-3">Dive into our blogs to learn more.</p>
                                </div>
                                <div>

                                    <span className='text-black font-bold'> &#8226; Our blog</span>

                                    <p className="mt-2 text-sm text-white pl-3">Read the latest posts on our blog.</p>
                                </div>
                                <div>

                                    <span className='text-black font-bold'>&#8226; Chat</span>

                                    <p className="mt-2 text-sm text-white pl-3">Comment on differnt posts.</p>
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <img
                                src="/src/images/robo.png"
                                alt="404"
                                className="h-full w-[300px] lg:w-[450px] rounded-md object-cover"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Blogs;
