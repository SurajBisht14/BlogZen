import React, { createContext, useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from './Navbar.jsx';


const MyContext = createContext();
function App() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState(() => {
    const storedAuth = localStorage.getItem('isAuth') === 'true';
    const storedUsername = localStorage.getItem('username') || '';
    return {
      isAuth: storedAuth,
      username: storedUsername,
    };
  });

  useEffect(() => {
    const checkTokenExpiration = () => {
      const expirationTime = localStorage.getItem('tokenExpiration');
      if (expirationTime && new Date().getTime() > expirationTime) {
        localStorage.removeItem('isAuth');
        localStorage.removeItem('username');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('token'); // Remove the token from local storage
        setAuthState({ isAuth: false, username: '' });
        navigate('/login'); // Redirect to login page
      }
    };

    checkTokenExpiration(); // Check token expiration on mount

    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [navigate]);


  useEffect(() => {
    if (authState.isAuth) {
      localStorage.setItem('isAuth', 'true');
      localStorage.setItem('username', authState.username);
    } else {
      localStorage.removeItem('isAuth');
      localStorage.removeItem('username');
    }
  }, [authState.isAuth, authState.username]);
  return (
    <>
      <MyContext.Provider value={{ authState, setAuthState }}>
        <Navbar />
        <Outlet />
      </MyContext.Provider>
    </>
  );
}

export default App;
export { MyContext };
