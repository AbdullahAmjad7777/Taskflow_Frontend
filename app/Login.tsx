'use client';
import { useState, useContext } from 'react';
import { AuthContext } from '../app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, register } = useContext(AuthContext);
  const router = useRouter();

  const [isLoginView, setIsLoginView] = useState(true); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (isLoginView) {
        await login(email.trim().toLowerCase(), password);
        router.push('/dashboard');
      } else {
        if (!name) throw new Error("Please enter your name");
        await register(name, email.trim().toLowerCase(), password);
        alert("Registration successful! Please login.");
        setIsLoginView(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Responsive background with a soft gradient
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-gray-100 to-blue-50 p-4">
      
      {/* Main Card with shadow and smooth entry transition */}
      <div className="p-8 border border-gray-100 rounded-2xl shadow-2xl w-full max-w-md bg-white transition-all duration-500 ease-in-out transform hover:scale-[1.01]">
        
        <header className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-600 tracking-tight italic">TaskFlow</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Created By Rana Abdullah</p>
        </header>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLoginView ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="animate-bounce text-red-600 bg-red-50 p-3 rounded-lg mb-4 text-sm border border-red-100 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Conditional Rendering with a simple opacity transition */}
          {!isLoginView && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button 
            className={`w-full py-3 rounded-lg text-white font-bold transform transition-all duration-200 active:scale-95 shadow-md ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLoginView ? 'Login' : 'Sign Up'}
          </button>
        </div>

        <div className="mt-8 text-center border-t pt-6 border-gray-50">
          <p className="text-gray-500 text-sm">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button 
            className="text-blue-600 font-bold hover:text-blue-800 transition-colors mt-2 block w-full text-center"
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError('');
            }}
          >
            {isLoginView ? 'Create an account' : 'Back to Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
