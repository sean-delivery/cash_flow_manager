import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  onLogin: (name: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
    navigate('/dashboard');
  };

  const handleGoogle = () => {
    onLogin('משתמש Google');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center">התחברות</h1>
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          כניסה
        </button>
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full border py-2 rounded flex items-center justify-center hover:bg-gray-100"
        >
          התחבר עם Google
        </button>
        <p className="text-center text-sm">
          אין לך חשבון?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            הירשם
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
