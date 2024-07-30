import React, {useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from './App.jsx';
import loaderImg from './images/loader.svg';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { authState, setAuthState } = useContext(MyContext); // Use authState and setAuthState

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [loadingPage, setLoadingPage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingPage(true); // Show loading page

    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setLoadingPage(false); 

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiration', data.tokenExpiration);
        setAuthState({ isAuth: true, username: data.username });
        setSuccessMsg(data.msg);
        setTimeout(() => {
          setSuccessMsg('');
          navigate('/');
        }, 1000);
        setFormData({
          email: '',
          password: '',
        });
      } 
      else {
        setErrorMsg(data.error);
        setTimeout(() => setErrorMsg(''), 5000);
      }
    } catch (error) {
      console.error('Error during Login:', error);
    }
  };

  return (
    <div className="h-[87vh] flex items-center justify-center relative">

      {errorMsg.length > 0 &&

        <p className="text-sm  bg-red-200 py-2 w-full text-red-600 fixed  top-[13vh] z-50 text-center">{errorMsg} <span className='absolute  pd-1 right-4 text-red-600 hover:cursor-pointer text-[20px] font-extrabold' onClick={() => { setErrorMsg("") }}>&#10005;</span></p>

      }

      {successMsg.length > 0 &&

        <p className="text-sm  bg-green-200 py-2 w-full text-green-600 fixed  top-[13vh] z-50 text-center">{successMsg} <span className='absolute  right-4 text-green-600 hover:cursor-pointer text-[20px] font-extrabold' onClick={() => { setSuccessMsg("") }}>&#10005;</span></p>

      }


      {loadingPage && (
        <div className='absolute top-0 left-0 h-full w-full z-50 flex items-center justify-center rounded-xl'>
          <img src={loaderImg} alt='loading' className='w-[90px]' />
        </div>
      )}
      <div className="bg-white p-8 rounded-xl shadow-[-1px_-1px_10px_rgba(0,0,0,.1),1px_1px_10px_rgba(0,0,0,.1)] h-[90%] w-[90%] sm:w-full max-w-md relative mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded-lg w-full py-4 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded-lg w-full py-4 px-3 text-gray-700  focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-gradient-to-r from-[rgba(0,0,0,1)] to-[rgba(0,0,0,.5)] text-white font-bold py-4 mt-5 w-full rounded-lg focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
          </div>
        </form>
        <p className='absolute right-10 bottom-10 lg:bottom-5 cursor-pointer text-[rgba(0,0,0,.8)] font-bold'>
          <Link to='/signup'>Don't have an account?</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
