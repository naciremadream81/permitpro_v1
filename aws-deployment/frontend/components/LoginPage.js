'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Input } from './ui';
import { apiService } from '../lib/api';

export default function LoginPage({ onLogin, onAdminLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isAdminLogin) {
        // Admin login - check for admin credentials
        if (formData.email === 'admin@permitpro.com' && formData.password === 'admin123') {
          onAdminLogin({
            id: 'admin',
            name: 'System Administrator',
            email: 'admin@permitpro.com',
            role: 'admin'
          });
        } else {
          setError('Invalid admin credentials. Please try again.');
        }
      } else {
        // Regular user login
        const response = await apiService.login(formData.email, formData.password);
        onLogin(response.user);
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PermitPro</h1>
            <p className="text-gray-600">
              {isAdminLogin ? 'Admin Access' : 'Sign in to manage your permits'}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsAdminLogin(!isAdminLogin)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {isAdminLogin ? 'Switch to User Login' : 'Admin Login'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className={`w-full ${isAdminLogin ? 'bg-red-600 hover:bg-red-700' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : (isAdminLogin ? 'Admin Sign In' : 'Sign In')}
            </Button>

            {isAdminLogin && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Admin Credentials:</strong><br />
                  Email: admin@permitpro.com<br />
                  Password: admin123
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
