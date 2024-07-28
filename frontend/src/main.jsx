import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './App.jsx';
import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import Home  from './Home.jsx';
import About from './About.jsx';
import SignUp from './SignUp.jsx';
import Login  from './Login.jsx';
import Blogs from './Blogs.jsx'
import BlogInfo  from './blogInfo.jsx';
import MyBlogs  from './myBlogs.jsx';

const routes= createBrowserRouter([
      {
        path : '/',
        element : <App />,
        children : [
            {
                path:'/',
                element : <Home/>
            },
            {
                path :'/about',
                element : <About/>
            },
            {
              path : '/createBlogs',
              element : <Blogs/>
             },
            {
              path :'/signup',
              element : <SignUp/>
            },
            {
              path :'/login',
              element : <Login/>
           },
            {
              path :'/blogInfo',
              element : <BlogInfo/>
            },
            {
              path : '/myBlogs',
              element : <MyBlogs/>
            }
        ]
      }
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <RouterProvider router={routes} />
  </React.StrictMode>
)
