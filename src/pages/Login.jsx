import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { toastApiError } from '../utils/toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toastApiError(err, 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-keep-bg">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">Notebook</h1>
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <PasswordInput
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          autoComplete="current-password"
          className="mb-4"
        />
        <button className="w-full bg-yellow-400 hover:bg-yellow-500 py-2 rounded font-medium">
          Sign in
        </button>
        <p className="text-sm text-center mt-4">
          No account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}