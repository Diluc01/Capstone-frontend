

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './HomePage'
import Auth from './Auth'
import CartOrderPage from './CartOrderPage'
import AdminProductPage from './Admin'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'


function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
useEffect(() => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL;
    // hit api to check if user is logged in
    fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then((response) =>{
        if(response.status===200){
          setIsLoggedIn(true);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error('Error:');
      });
  },[])

  const logout = () =>{
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  }

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900"><a href="/">Shoe Haven</a></h1>
          <nav className="flex space-x-6">
            <a href="/" className="text-gray-800 hover:text-blue-600">Home</a>
            <a href="/cart" className="text-gray-800 hover:text-blue-600">Cart/Orders</a>
            {
              isLoggedIn ? 
              <p onClick={logout}  className="text-gray-800 hover:text-blue-600 cursor-pointer">Logout</p>
              :
               <a href="/auth" className="text-gray-800 hover:text-blue-600">Login</a>
            }
          </nav>
        </div>
      </header>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<CartOrderPage />} />
          <Route path="/admin" element={<AdminProductPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App