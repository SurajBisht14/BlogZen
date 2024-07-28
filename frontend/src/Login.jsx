// import React, { useRef, useState,useContext} from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {MyContext} from './App.jsx'

// function Login() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const navigate = useNavigate();
//   const { authState, setAuthState} = useContext(MyContext);



//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const [loadingPage, setLoadingPage] = useState(false);
//   const errorBox = useRef(null);
//   let [ErrorMsg,setErrorMsg] = useState("");
//   let [successMsg,setsuccessMsg] = useState("")


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log(isAuth)
//     setLoadingPage(true);       //showing load page

//     try {
//       const response = await fetch('http://localhost:7000/login', {
//         method: 'POST',
//         headers: {
//           "Content-Type": "application/json"
//         },
//         credentials: 'include', // Include cookies with the request
//         body: JSON.stringify(formData)
//       });
//       const data = await response.json();
//       setLoadingPage(false);  //closing load page

//       if (response.ok) {
//         setAuthState({ isAuth: true, username: data.username });
//         setsuccessMsg(data.msg);
//         setTimeout(()=>{
//           setsuccessMsg("");
//           navigate('/');
//       },1000);          
//         setFormData({
//           email: '',
//           password: '',
//         })
//         console.log(authState)
//       }
//       else {
//         setErrorMsg(data.error);
//         setTimeout(()=>{setErrorMsg("")},2000); 
//       }
//     }
//     catch (error) {
//       console.error('Error during Login:', error);
//     }
//   }


//   return (
//     <div className="h-[87vh] flex items-center justify-center relative">

//         {/* errorMsg */}

//         {ErrorMsg &&<div className='absolute transition-all top-[0] bg-red-200 text-red-600 z-[30] border-2 border-red-600 w-full  font-bold h-[5%] p-5 flex items-center justify-center font-serif text-[25px]' ref={errorBox}>{ErrorMsg}</div>}
//         {successMsg && <div className='absolute  transition-all top-[0] bg-green-200 text-green-600 z-[30] border-2 border-green-600 w-full  font-bold h-[5%] p-5 flex items-center justify-center font-serif text-[25px]' ref={errorBox}>{successMsg}</div>}



//        {loadingPage && (
//           <div className='absolute top-0 left-0 h-full w-full z-50 flex items-center justify-center rounded-xl'>
//             <img src='/src/images/loader.svg' alt='loading' className='w-[90px]' />
//           </div>
//         )}
//       <div className="bg-white p-8 rounded-xl shadow-[-1px_-1px_10px_rgba(0,0,0,.1),1px_1px_10px_rgba(0,0,0,.1)] h-[90%] w-[90%] sm:w-full max-w-md relative mt-8">
//         <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
//         <form onSubmit={handleSubmit} >
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="shadow appearance-none border rounded-lg w-full py-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="shadow appearance-none border rounded-lg w-full py-4  px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               required
//             />
//           </div>
//           <div className="flex items-center justify-between">
//             <button
//               type="submit"
//               className="bg-gradient-to-r from-[rgba(0,0,0,1)] to-[rgba(0,0,0,.5)] text-white font-bold py-4  mt-5 w-full rounded-lg focus:outline-none focus:shadow-outline"
//             >
//               Login
//             </button>
//           </div>
//         </form>
//         <p className='absolute right-10 bottom-10 lg:bottom-5 cursor-pointer  text-[rgba(0,0,0,.8)]  font-bold'>
//           <Link to='/signup'>Don't have an account?</Link>
//         </p>
       
//       </div>
//     </div>
//   );
// }

// export default Login;

import React, { useRef, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from './App.jsx';

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
  const errorBox = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingPage(true); // Show loading page

    try {
      const response = await fetch('http://localhost:7000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies with the request
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setLoadingPage(false); // Hide loading page

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
      } else {
        setErrorMsg(data.error);
        setTimeout(() => setErrorMsg(''), 2000);
      }
    } catch (error) {
      console.error('Error during Login:', error);
    }
  };

  return (
    <div className="h-[87vh] flex items-center justify-center relative">
      {/* errorMsg */}
      {errorMsg && (
        <div
          className='absolute transition-all top-[0] bg-red-200 text-red-600 z-[30] border-2 border-red-600 w-full font-bold h-[5%] p-5 flex items-center justify-center font-serif text-[25px]'
          ref={errorBox}
        >
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div
          className='absolute transition-all top-[0] bg-green-200 text-green-600 z-[30] border-2 border-green-600 w-full font-bold h-[5%] p-5 flex items-center justify-center font-serif text-[25px]'
          ref={errorBox}
        >
          {successMsg}
        </div>
      )}

      {loadingPage && (
        <div className='absolute top-0 left-0 h-full w-full z-50 flex items-center justify-center rounded-xl'>
          <img src='/src/images/loader.svg' alt='loading' className='w-[90px]' />
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
