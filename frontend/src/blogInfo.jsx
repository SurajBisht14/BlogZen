import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MyContext } from './App.jsx';
import loaderImg from './images/loader.svg';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function BlogInfo() {
    const location = useLocation();
    const { article } = location.state || {};
    const [showMore, setShowMore] = useState(true);
    const [content1, setContent1] = useState("");
    const { authState, setAuthState } = useContext(MyContext);
    const [loadingPage, setLoadingPage] = useState(false);
    const [finalCommentDiv, setFinalCommentDiv] = useState([]);
    const [commentPosted, setcommentPosted] = useState("");


    const [commentValue, setCommentValue] = useState({
        comment: "",
        articleId: article?._id || null,
    });

    useEffect(() => {
        if (article) {
            setContent1(showMore ? readMore(article.content) : article.description + article.content);
        }
    }, [article, showMore]);

    useEffect(() => {
        if (article) {
            gettingComment();
        }
    }, [article, commentPosted]);

    async function gettingComment() {
        let articleId = article._id;

        try {
            const fetchData = await fetch(`${backendUrl}/get_comments`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ articleId }),
            });

            const data = await fetchData.json();
            if (data && data.comments && Array.isArray(data.comments)) {
                let commentArray = data.comments.map((e, key) => (
                    <div key={key} className='w-full mt-2'>
                        <div className='mx-auto w-[95%] md:w-[80%] border rounded-lg'>
                            <div className="px-3 mt-2">
                                <h1 className='text-[18px] font-bold'>{e.postedBy}</h1>
                                <h1 className='text-[12px]'>{e.posted_on}</h1>
                                <p className='font-serif pt-2 pb-4'>{e.comment}</p>
                            </div>
                        </div>
                    </div>
                ));

                setFinalCommentDiv(commentArray);
            } else {
                setFinalCommentDiv([]);
            }

        } catch (error) {
            console.log(error);
        }
    }


    function readMore(str) {
        let arrayOfString = str.split(" ");
        let slicedArray = arrayOfString.slice(0, arrayOfString.length / 3).join(" ");
        return article.description + slicedArray;
    }

    function toggleContent() {
        setShowMore(!showMore);
    }

    function commentInput(e) {
        const { name, value } = e.target;
        setCommentValue((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    }

    async function handleCommentSubmit(e) {
        e.preventDefault();
        setLoadingPage(true);
        try {
            const response = await fetch(`${backendUrl}/article_comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(commentValue),
            });

            if (response.ok) {
                setCommentValue({
                    comment: "",
                    articleId: article?._id || null,
                });

                let data = await response.json();
                // window.location.reload();
                setcommentPosted(data.msg);
                setTimeout(()=>{setcommentPosted("")},3000)

                const newComment = {
                    postedBy: authState.username, // Assuming the username is in authState
                    posted_on: new Date().toISOString(), // Set current date
                    comment: commentValue.comment
                };

                setFinalCommentDiv((prevComments) => [
                    <div key={prevComments.length} className='w-full mt-2'>
                        <div className='mx-auto w-[95%] md:w-[80%] border rounded-lg'>
                            <div className="px-3 mt-2">
                                <h1 className='text-[18px] font-bold'>{newComment.postedBy}</h1>
                                <h1 className='text-[12px]'>{newComment.posted_on}</h1>
                                <p className='font-serif pt-2 pb-4'>{newComment.comment}</p>
                            </div>
                        </div>
                    </div>,
                    ...prevComments
                ]);
            }
            else {
                console.error("Failed to submit comment:", response.statusText);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoadingPage(false);
        }
    }


    function removeHtmlTags(str) {
        
        let cleanedStr = str.replace(/<img\b[^>]*>/gi, '');
        cleanedStr = cleanedStr.replace(/<[^>]+>/g, '');

        return cleanedStr;
    }

    return (
        <div className="h-[87vh] overflow-y-scroll w-screen">
            {loadingPage && (
                <div className='fixed h-screen w-screen top-0 left-0 z-50 flex items-center justify-center rounded-xl'>
                    <img src={loaderImg} className='fixed w-[150px]' alt='loading' />
                </div>
            )}

            {commentPosted.length > 0 &&

                <p className="text-sm  bg-green-200 py-2 w-full text-green-600 fixed  top-[13vh] z-50 text-center">{commentPosted} <span className='absolute right-4 text-green-600 hover:cursor-pointer text-[20px] font-extrabold' onClick={() => { setcommentPosted("") }}>&#10005;</span></p>

            }
            <div>
                <div className="mx-auto md:mt-10 md:w-[80%] rounded-md border overflow-hidden">
                    <img
                        src={article.urlToImage}
                        alt={article.category_name}
                        className="rounded-b-md  md:object-center h-[300px] md:h-[500px] w-full"
                    />
                    <div className='p-4'>
                        <p className="text-lg font-semibold leading-tight text-gray-900">
                            Author: {article.author}
                        </p>
                        <p className="text-lg leading-loose text-gray-600">Posted On: {article.publishedAt.slice(0, 10)}</p>
                    </div>
                    <div className="p-4">
                        <h1 className="text-lg font-semibold">{article.title}</h1>
                        <p className="mt-3 text-sm  leading-[25px] text-gray-600">
                            {removeHtmlTags(content1)}
                            <span className="text-black font-bold hover:cursor-pointer" onClick={toggleContent}>
                                {showMore ? "Read more..." : "Show less..."}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Comment box to post comment */}
            <div className='h-[300px] w-full'>
                <h1 className='font-bold text-[30px]  text-center pt-4'>Comments</h1>
                <div className='mx-auto w-[95%] md:w-[80%] mt-5'>
                    <form className="w-full bg-white rounded-lg border pt-4" onSubmit={handleCommentSubmit}>
                        <div className="px-3 mb-2 mt-2">
                            <textarea
                                placeholder="Write a comment"
                                className="w-full bg-gray-100 rounded border border-gray-400 leading-normal resize-none h-20 py-2 px-3 font-medium placeholder-gray-400 focus:outline-none focus:bg-white"
                                onChange={commentInput}
                                value={commentValue.comment}
                                name='comment'
                            ></textarea>
                        </div>
                        {authState.isAuth ? (
                            <div className="flex justify-end px-4 mb-2">
                                <input
                                    type="submit"
                                    className="px-2.5 py-1.5 rounded-md text-white text-sm bg-indigo-500 hover:cursor-pointer"
                                    value="Comment"
                                />
                            </div>
                        ) : (
                            <div className='w-full pb-5 text-gray-400 text-center'>Please Login to comment</div>
                        )}
                    </form>
                </div>

                {/* Comments display section */}
                <div className='pb-10 w-full'>
                    <div className='w-full mt-2 '>
                        {finalCommentDiv.length === 0 ? (
                            <div className='mx-auto w-[95%] md:w-[80%] h-[200px] border rounded-lg flex items-center justify-center'>
                                <span className='text-gray-400 text-[20px]'>No comments yet</span>
                            </div>
                        ) : (
                            finalCommentDiv.map((e) => { return (e) })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogInfo;
