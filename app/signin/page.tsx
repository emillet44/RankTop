'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Validation states
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [usernameError, setUsernameError] = useState('')

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('');
    } else if (!emailRegex.test(value)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('');
    } else if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else {
      setPasswordError('');
    }
  };

  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError('');
    } else if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
    } else if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      setUsernameError('Only letters, numbers, hyphens, and underscores allowed');
    } else if (value.toLowerCase() === 'guest') {
      setUsernameError('"Guest" is a reserved name');
    } else {
      setUsernameError('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (isSignUp) validatePassword(value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Final validation before submit
    if (isSignUp) {
      validateEmail(email);
      validatePassword(password);
      validateUsername(username);

      if (emailError || passwordError || usernameError) {
        return;
      }
    }

    setLoading(true)

    if (isSignUp) {
      // SIGN UP LOGIC
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }
    }

    // SIGN IN LOGIC (Shared for Login and post-Signup)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid credentials')
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  const isFormValid = isSignUp 
    ? email && password && username && !emailError && !passwordError && !usernameError
    : email && password;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 p-8 rounded-xl w-full max-w-md border border-slate-800">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          {isSignUp ? 'Join Ranktop' : 'Welcome Back'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
                className={`w-full px-4 py-2 bg-slate-800 border rounded text-white ${
                  usernameError ? 'border-red-500' : 'border-slate-700'
                }`}
                required
              />
              {usernameError && (
                <p className="text-red-500 text-xs mt-1">{usernameError}</p>
              )}
            </div>
          )}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-2 bg-slate-800 border rounded text-white ${
                emailError ? 'border-red-500' : 'border-slate-700'
              }`}
              required
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-2 bg-slate-800 border rounded text-white ${
                passwordError ? 'border-red-500' : 'border-slate-700'
              }`}
              required
            />
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>
          <button 
            type="submit" 
            disabled={loading || !isFormValid} 
            className="w-full bg-blue-600 py-3 rounded font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="my-6 border-t border-slate-800 relative">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-slate-500">or</span>
        </div>

        <button 
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full bg-white text-black py-3 rounded font-bold flex items-center justify-center gap-2"
        >
          Continue with Google
        </button>

        <button 
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError('')
            setEmailError('')
            setPasswordError('')
            setUsernameError('')
          }} 
          className="w-full mt-4 text-slate-400 hover:text-white text-sm"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </div>
    </div>
  )
}