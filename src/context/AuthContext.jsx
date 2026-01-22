import { createContext, useState, useEffect, useCallback, useContext } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchProfile = async (sessionUser) => {
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUser.id)
          .single()

        if (mounted) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email,
            ...profile
          })
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        // Set user even if profile fetch fails, to avoid "logout" state
        if (mounted) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user)
      } else {
        if (mounted) {
          setLoading(false)
        }
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Only fetch if we don't have the user pending
          // Actually on refresh, this might fire.
          fetchProfile(session.user)
        } else {
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
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
        if (email === 'admin@bhujdham2010.com' && !userRole) {
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
        if (email === 'admin@bhujdham2010.com') {
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
