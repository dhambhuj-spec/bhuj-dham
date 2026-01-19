import { createContext, useState, useEffect, useCallback, useContext } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          // Get user profile from our users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
          
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            ...profile
          })
        }
      } catch (err) {
        if (err?.name === 'AbortError') return
        console.error('Error checking auth:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setUser({
            id: session.user.id,
            email: session.user.email,
            ...profile
          })
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const register = useCallback(async (email, password, username, phone) => {
    try {
      setError('')
      
      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`
        }
      })

      if (signUpError) throw signUpError

      // Create user profile with proper error handling
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email,
              username,
              phone,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw profileError
        }

        setUser({
          id: authData.user.id,
          email,
          username,
          phone,
          ...profile
        })
      } catch (profileErr) {
        console.error('Failed to create profile:', profileErr)
        // Still consider registration successful if auth succeeded
        setUser({
          id: authData.user.id,
          email,
          username,
          phone
        })
      }

      return { success: true, message: 'Registration successful! Please check your email to verify your account.' }
    } catch (err) {
      const message = err.message || 'Registration failed'
      setError(message)
      return { success: false, message }
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      setError('')
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) throw loginError

      // Get user profile (with error handling)
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        // Check if this is the admin email and set role accordingly
        let userRole = profile?.role
        if (email === 'admin@bhujdham.com' && !userRole) {
          // Update or create user with admin role
          const { data: updatedProfile } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              role: 'admin'
            }, { onConflict: 'id' })
            .select()
            .single()
          
          userRole = 'admin'
        }

        setUser({
          id: data.user.id,
          email: data.user.email,
          role: userRole,
          ...(profile || {})
        })
      } catch (profileErr) {
        // Profile doesn't exist, create it for admin if needed
        if (email === 'admin@bhujdham.com') {
          try {
            await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email,
                role: 'admin'
              })
          } catch (insertErr) {
            console.error('Failed to create admin profile:', insertErr)
          }
          
          setUser({
            id: data.user.id,
            email: data.user.email,
            role: 'admin'
          })
        } else {
          setUser({
            id: data.user.id,
            email: data.user.email
          })
        }
      }

      return { success: true }
    } catch (err) {
      const message = err.message || 'Login failed'
      setError(message)
      return { success: false, message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setError('')
    } catch (err) {
      setError(err.message || 'Logout failed')
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
