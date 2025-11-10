import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Login.css';

export default function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState(0);
  const navigate = useNavigate();
  const { login, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validateName = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Name is required';
    }
    if (trimmed.length < 2 || trimmed.length > 64) {
      return 'Name must be between 2 and 64 characters';
    }
    if (!/^[a-zA-Z0-9._\s]+$/.test(trimmed)) {
      return 'Name can only contain letters, digits, spaces, dots, and underscores';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameError = validateName(name);
    const passwordError = validatePassword(password);

    if (nameError || passwordError) {
      setErrors({ name: nameError, password: passwordError });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Add delay for failed attempts
      if (loginAttempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // TODO: Replace with actual API call
      // Mock validation - in real app, this would be an API call
      if (name.trim() === 'admin' && password === 'password123') {
        await login(name.trim(), password, rememberMe);
        navigate('/dashboard', { replace: true });
      } else {
        setErrors({ general: 'Invalid credentials' });
        setPassword(''); // Clear password on failure
        setLoginAttempt((prev) => prev + 1);
      }
    } catch (error) {
      setErrors({ general: 'Invalid credentials' });
      setPassword('');
      setLoginAttempt((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Iliri</h1>
          <p className="login-subtitle">Inventory Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && (
            <div className="login-error" role="alert">
              {errors.general}
            </div>
          )}
          <div className="login-field">
            <label htmlFor="name" className="login-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              className={`login-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your name"
              required
              autoComplete="username"
            />
            {errors.name && (
              <span className="login-field-error">{errors.name}</span>
            )}
          </div>
          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              className={`login-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="login-field-error">{errors.password}</span>
            )}
          </div>
          <div className="login-field">
            <label className="login-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-checkbox"
              />
              <span>Remember me</span>
            </label>
          </div>
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

