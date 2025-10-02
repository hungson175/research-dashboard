import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSyncAPI() {
  try {
    console.log('🔐 Logging in...')

    // Try to login, if fails, create user
    let authData = null
    let { data, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    })

    if (authError && authError.message.includes('Invalid login credentials')) {
      console.log('   User not found, creating new user...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      })

      if (signUpError) {
        console.error('❌ Signup error:', signUpError.message)
        return
      }

      authData = signUpData
      console.log('   ✓ User created, logging in...')

      // Login again
      const loginResult = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      })

      authData = loginResult.data
      authError = loginResult.error
    } else {
      authData = data
    }

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return
    }

    console.log('✅ Logged in as:', authData.user.email)

    // Get session token
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      console.error('❌ No session found')
      return
    }

    console.log('\n🚀 Calling sync API...')

    // Call the sync API
    const response = await fetch('http://localhost:3002/api/sync-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    console.log('   Response status:', response.status)
    console.log('   Response headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()

    if (!response.ok) {
      console.error('❌ API Error (status', response.status, '):')
      console.error(responseText.substring(0, 500))
      return
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error('❌ Failed to parse JSON response:')
      console.error(responseText.substring(0, 500))
      return
    }

    console.log('\n✅ Sync completed!')
    console.log('📊 Results:', JSON.stringify(result.results, null, 2))

    if (result.details.success.length > 0) {
      console.log('\n✓ Successfully inserted:')
      result.details.success.forEach(item => console.log(`  - ${item}`))
    }

    if (result.details.skipped.length > 0) {
      console.log('\n⊘ Skipped (already exists):')
      result.details.skipped.forEach(item => console.log(`  - ${item}`))
    }

    if (result.details.errors.length > 0) {
      console.log('\n✗ Errors:')
      result.details.errors.forEach(item => console.log(`  - ${item}`))
    }

  } catch (error) {
    console.error('❌ Fatal error:', error)
  }
}

testSyncAPI()
