import { useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Minimal client-side validation: RED->GREEN for TC-A002
    if (!username || !email || !password) {
      setError('All fields required');
      return;
    }
    try {
      const response = await axios.post("http://localhost:4001/user/sign-up", { username, email, password });
      if (response.status === 200 || response.status === 201) {
        navigate('/login');
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        setError('Error creating user. Please try again.');
        console.log('Error:', response.data);
      }
    } catch (error) {
        const serverData = error.response?.data;
        if (serverData) {
          const serverMsg = serverData.message || '';
          const details = Array.isArray(serverData.errors) ? serverData.errors.join(', ') : '';
          setError(details ? `${serverMsg}: ${details}` : serverMsg || 'An error occurred during sign-up.');
        } else {
          setError('An error occurred during sign-up. Please try again.');
        }
        console.log('Error response data:', error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md border border-white/20">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">Sign Up</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
          <p className="text-sm text-center text-gray-600 mt-4">
            <Link to="/login" className="underline hover:text-blue-600">Already have an account? Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
