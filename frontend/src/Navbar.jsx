import { Link, useNavigate, useLocation } from "react-router-dom";
import headerText from './images/headerText.png';
import { useRef, useState, useEffect, useContext } from "react";
import { MyContext } from './App.jsx';
import loaderImg from './images/loader.svg';
import userImg from './images/user.svg';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Navbar() {
    const [Nav, setNav] = useState(false);
    const navRef = useRef(null);
    const [YesLogOutpage, SetYesLogOutpage] = useState(false);
    const [loading, setLoading] = useState(false);
    const { authState, setAuthState } = useContext(MyContext);
    const [showLogoutBox, setshowLogoutBox] = useState(false);
    const currentPath = useLocation().pathname;

    const location = useNavigate();
    useEffect(() => {
        if (Nav) {
            navRef.current.style.top = '100%';
        } else {
            navRef.current.style.top = '-50vh';
        }
    }, [Nav]);

    async function logoutFunction() {
        SetYesLogOutpage(false);
        setLoading(true);  // Set loading to true before making request
        try {
            let fetchData = await fetch(`${backendUrl}/logout`, {
                method: 'GET',
                credentials: 'include',
            });
            let data = await fetchData.json();
            if (fetchData.ok && data.showLogin) {
                setAuthState({ isAuth: false, username: '' });
                location('/');

            }
        } catch (error) {
            console.log("error")
        } finally {
            setLoading(false);
        }
    }

    function navbar() {
        setNav(!Nav);
    }

    function goBack() {
        if (navRef.current) {
            navRef.current.style.top = '-250%';
        }
        setNav(false);
    }
    function callingSmallLogOutBox() {
        setshowLogoutBox(!showLogoutBox)
    }

    return (
        <>
            <header id="desktopHeader" className="w-[100vw] h-[13vh] flex relative">
                {YesLogOutpage &&
                    <div className="h-screen w-screen bg-[rgba(0,0,0,.9)] z-50 absolute flex items-center justify-center top-0">
                        <div className="bg-[rgba(255,255,255,.8)]  w-[400px] h-[100px] rounded-lg flex items-center justify-center flex-col  font-serif">
                            <h1 className="text-center text-[20px]">Do you want to log out ?</h1>
                            <div className="flex items-center  justify-center mt-4 gap-5 w-full">
                                <button className="bg-indigo-500 hover:bg-indigo-600 rounded-lg w-[20%] p-1 text-white" onClick={() => SetYesLogOutpage(false)}>No</button>
                                <button className="bg-indigo-500 hover:bg-indigo-600 rounded-lg w-[20%] p-1 text-white" onClick={logoutFunction}>Yes</button>
                            </div>
                        </div>
                    </div>
                }
                {loading && (
                    <div className='h-screen w-screen fixed flex items-center justify-center z-50'>
                        <img src={loaderImg} className='w-[100px]' alt="Loading" />
                    </div>
                )}
                <img src={headerText} className="w-[200px] h-full object-cover z-[100]" alt="Header Text" />



                <nav className="hidden lg:flex h-[100%]  w-[100%] z-[99] absolute left-0 justify-end bg-[rgba(0,0,0,1)]">
                    <ul className="flex h-full items-center justify-around min-w-[80%] relative">
                        <li><Link to='/' className={`text-20px font-serif font-bold text-white pb-2 rounded-sm ${currentPath === '/' ? 'border-b-4' : 'border-b-0'}`}>Home</Link></li>
                        <li><Link to='/about' className={`text-20px font-serif font-bold text-white pb-2 rounded-sm ${currentPath === '/about' ? 'border-b-4' : 'border-b-0'}`}>About</Link></li>
                        <li><Link to='/createBlogs' className={`text-20px font-serif font-bold text-white pb-2 rounded-sm ${currentPath === '/createBlogs' ? 'border-b-4' : 'border-b-0'}`}>Create</Link></li>
                        <li><Link to='/signup' className={`text-20px font-serif font-bold text-white pb-2 rounded-sm ${currentPath === '/signup' ? 'border-b-4' : 'border-b-0'}`}>SignUp</Link></li>
                        {authState.isAuth ? (
                            <li className=" text-[red]  items-center flex flex-col justify-center  cursor-pointer  pt-4 relative"> <img src={userImg} className="w-[20px]" onClick={callingSmallLogOutBox} />
                                <span onClick={callingSmallLogOutBox} className="font-bold">{authState.username}</span>
                                {
                                    showLogoutBox &&
                                    <span className="h-[110px] flex flex-col items-center justify-center w-[100px] bg-[red] absolute top-[70px] rounded-md right-[-45px]">
                                        <span className="absolute right-[10px] text-black   top-0 text-[18px]  font-bold flex  items-center z-[100] hover:cursor-pointer hover:text-white" onClick={() => setshowLogoutBox(!showLogoutBox)}>&#10005;</span>
                                        <span className="text-black  flex items-center pl-1  mt-5 gap-2 w-full hover:text-white" onClick={() => { setshowLogoutBox(!showLogoutBox); SetYesLogOutpage(true) }}>
                                            <i className="fa-solid fa-right-from-bracket"></i>Logout
                                        </span>
                                        <Link to='/myBlogs'><span className="text-black  flex items-center mt-3 gap-2 w-full hover:text-white" onClick={() => { setshowLogoutBox(!showLogoutBox) }}><i className="fa-solid fa-blog"></i>My Blogs</span></Link>
                                    </span>
                                }
                            </li>
                        ) : (
                            <li><Link to='/login' className={`text-white text-20px font-serif rounded-sm font-bold pb-2 ${currentPath === '/login' ? 'border-b-4' : 'border-b-0'}`}>Login</Link></li>
                        )}
                    </ul>
                </nav>

                {/* small device navbar */}
                <div className="lg:hidden h-[100%] w-[100%] z-[99] absolute left-0 bg-[rgba(0,0,0,1)]"></div>
                <nav ref={navRef} className="lg:hidden h-[50vh] w-[100vw] absolute left-0 top-[-50vh] z-[98] transition-all duration-300 ease-in-out bg-[rgba(0,0,0,1)] border-t-white border-t-2 text-center">
                    <ul className="h-full w-full flex flex-col items-center justify-around relative">
                        <li><Link to='/' className={` text-20px font-serif font-bold ${currentPath === '/' ? 'text-[red]' : 'text-white'}`} onClick={goBack}>Home</Link></li>
                        <li><Link to='/about' className={` text-20px font-serif font-bold ${currentPath === '/about' ? 'text-[red]' : 'text-white'}`} onClick={goBack}>About</Link></li>
                        <li><Link to='/createBlogs' className={` text-20px font-serif font-bold ${currentPath === '/create' ? 'text-[red]' : 'text-white'}`} onClick={goBack}>Create</Link></li>
                        <li><Link to='/signup' className={` text-20px font-serif font-bold ${currentPath === '/signup' ? 'text-[red]' : 'text-white'}`} onClick={goBack}>SignUp</Link></li>
                        {!authState.isAuth &&
                            <li><Link to='/login' className={` text-20px font-serif font-bold ${currentPath === '/login' ? 'text-[red]' : 'text-white'}`} onClick={goBack}>Login</Link></li>
                        }
                    </ul>
                </nav>
                {
                    authState.isAuth &&
                    <li className="text-[red] h-full items-center lg:hidden flex  flex-col justify-center font-bold  cursor-pointer z-[100]  absolute top-0 right-[70px]"> <img src={userImg} className="w-[20px]" onClick={callingSmallLogOutBox} />
                        <span onClick={callingSmallLogOutBox}>{authState.username}</span>

                        {
                            showLogoutBox &&
                            <span className="h-[130px] flex flex-col items-center justify-center w-[130px] bg-[red]  absolute top-[80px]  rounded-md right-[-55px]">
                                <span className="absolute right-[10px] text-black    top-0 text-[20px]  font-bold flex  items-center z-[150] hover:cursor-pointer hover:text-white" onClick={() => setshowLogoutBox(!showLogoutBox)}>&#10005;</span>
                                <span className="text-black  flex items-center pl-5  mt-5 gap-2 w-full hover:text-white" onClick={() => { setshowLogoutBox(!showLogoutBox); SetYesLogOutpage(true) }}>
                                    <i className="fa-solid fa-right-from-bracket"></i>Logout
                                </span>
                                <Link to='/myBlogs'><span className="text-black  flex items-center mt-6 gap-2 w-full hover:text-white" onClick={() => { setshowLogoutBox(!showLogoutBox) }}><i className="fa-solid fa-blog"></i>My Blogs</span></Link>
                            </span>
                        }
                    </li>
                }

                {Nav ? (
                    <span className="absolute right-[20px] text-white h-full  text-[40px] flex lg:hidden items-center z-[100] hover:cursor-pointer " onClick={navbar}>&#10005;</span> //cross
                ) : (
                    <span className="absolute right-[20px] text-white  h-full text-[35px] flex lg:hidden items-center z-[100] hover:cursor-pointer" onClick={navbar}>&#9776;</span> //hamburger
                )}
            </header>

        </>
    );
}

export default Navbar;
