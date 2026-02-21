'use client';
import { useState, useContext } from 'react';
import { AuthContext } from '../app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, register } = useContext(AuthContext); // register function add kiya
  const router = useRouter();

  const [isLoginView, setIsLoginView] = useState(true); 
  const [name, setName] = useState(''); // New State for Name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (isLoginView) {
        // --- LOGIN LOGIC ---
        await login(email.trim().toLowerCase(), password);
        router.push('/dashboard');
      } else {
        // --- SIGNUP LOGIC ---
        if (!name) throw new Error("Please enter your name");
        
        await register(name, email.trim().toLowerCase(), password);
        alert("Registration successful! Please login.");
        setIsLoginView(true); // Signup ke baad Login par bhej do
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 border rounded-xl shadow-lg w-96 bg-white">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLoginView ? 'Welcome Back' : 'Create Account'}
        </h1>

        {error && <p className="text-red-500 bg-red-50 p-2 rounded mb-4 text-sm">{error}</p>}

        <div className="space-y-4">
          {/* Conditional Rendering: Name field sirf Signup mein dikhegi */}
          {!isLoginView && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button 
            className={`w-full py-3 rounded-lg text-white font-bold transition ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLoginView ? 'Login' : 'Sign Up'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button 
            className="text-blue-600 font-semibold hover:underline mt-1"
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError(''); // Clear errors when switching
            }}
          >
            {isLoginView ? 'Create an account' : 'Back to Login'}
          </button>
        </div>
      </div>
    </div>
  );
}