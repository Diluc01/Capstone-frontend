import React, { useState } from 'react';
import { toast } from 'react-toastify';

const AuthPage = () => {

  //load env variable 
  const API_URL = import.meta.env.VITE_API_URL;

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //  authentication logic here
    e.preventDefault();
    console.log(isLogin ? 'Login' : 'Signup', formData);
    if (isLogin) toast.loading('Logging in...');
    else toast.loading('Signing up...');
    if (isLogin) {
      // post request on API URL with form data
      fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.token) {
            // save to local storage
            localStorage.setItem('token', data.token);
            // redirect to home page
            window.location.href = '/';
          }

        }).catch((error) => {
          console.error('Error:', error);
          toast.error('Error:');
        });
    } else {

      // post request on API URL with form data
      fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.token) {
            // save to local storage
            localStorage.setItem('token', data.token);
            // redirect to home page
            window.location.href = '/';
          }
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('Error:');
        });

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md">
        <div className="flex border-b">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-3 text-center font-semibold ${isLogin
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-3 text-center font-semibold ${!isLogin
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Enter your name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;