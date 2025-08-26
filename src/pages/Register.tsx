import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onRegister: (name: string) => void;
}

const Register: React.FC<Props> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(name || email);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center">הרשמה</h1>
        <input
          type="text"
          placeholder="שם מלא"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="tel"
          placeholder="טלפון"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
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
        <div className="flex justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="verify"
              value="phone"
              checked={method === 'phone'}
              onChange={() => setMethod('phone')}
            />
            אימות טלפוני
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="verify"
              value="email"
              checked={method === 'email'}
              onChange={() => setMethod('email')}
            />
            אימות באימייל
          </label>
        </div>
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          הירשם
        </button>
      </form>
    </div>
  );
};

export default Register;
