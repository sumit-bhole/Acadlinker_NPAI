import React, { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from './Input'; // Adjust path if necessary

const RegisterForm = ({ onSwitchView }) => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // 1. Create a specific payload object
    // If your backend still expects 'full_name', we combine them here:
    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      // Combine first and last name
      full_name: `${form.first_name} ${form.last_name}`.trim(),
      // Keep these just in case backend has been updated to accept them too
      first_name: form.first_name,
      last_name: form.last_name,
    };

    try {
      // 2. Log the data to console so you can see exactly what is being sent
      console.log('Sending Registration Data:', payload);

      // 3. Send the modified payload instead of the raw 'form' state
      const result = await register(payload);
      
      setMsg(result?.message || 'Success!');
    } catch (error) {
      console.error("Registration Error:", error);
      setMsg(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>
        <p className="text-gray-500 mt-2">Create your account to join the community.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <Input
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
          />
          <Input
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />

        {msg && (
          <div 
            className={`text-center text-sm p-3 rounded-xl font-medium border ${
              // FIX: Use .toLowerCase() to match 'success', 'Success', 'SUCCESS', etc.
              msg.toLowerCase().includes('success') 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            {msg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-3.5 rounded-xl font-semibold text-lg flex justify-center items-center shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200 mt-2"
        >
          {loading ? (
            <Loader2 className="animate-spin h-6 w-6" />
          ) : (
            <>
              Create Account <UserPlus className="h-5 w-5 ml-2" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={onSwitchView} 
            className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors ml-1"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;