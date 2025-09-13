// Simulate browser localStorage for testing
const { JSDOM } = require('jsdom');
const dom = new JSDOM();
global.window = dom.window;
global.localStorage = dom.window.localStorage;
global.btoa = dom.window.btoa;
global.atob = dom.window.atob;

// Import auth service (copy the logic)
class AuthService {
  generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  hashPassword(password) {
    return btoa(password + 'salt');
  }

  getStoredUsers() {
    const users = localStorage.getItem('caribbeanAI_users');
    return users ? JSON.parse(users) : [];
  }

  saveUsers(users) {
    localStorage.setItem('caribbeanAI_users', JSON.stringify(users));
  }

  async signUp(email, password, fullName, role, phone) {
    try {
      const users = this.getStoredUsers();
      
      if (users.find(u => u.email === email)) {
        return { user: null, error: 'An account with this email already exists' };
      }

      const user = {
        id: this.generateId(),
        email,
        full_name: fullName,
        role,
        phone,
        is_active: true
      };

      const userWithPassword = { ...user, password_hash: this.hashPassword(password) };
      users.push(userWithPassword);
      this.saveUsers(users);

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred during signup' };
    }
  }

  async signIn(email, password) {
    try {
      const users = this.getStoredUsers();
      const userWithPassword = users.find(u => u.email === email);

      if (!userWithPassword || userWithPassword.password_hash !== this.hashPassword(password)) {
        return { user: null, error: 'Invalid email or password' };
      }

      const { password_hash, ...user } = userWithPassword;

      if (!user.is_active) {
        return { user: null, error: 'Your account has been deactivated' };
      }

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred during sign in' };
    }
  }
}

const authService = new AuthService();

// Test authentication flow
async function testAuth() {
  console.log('=== Testing Authentication ===');
  
  // Check initial state
  console.log('Initial users:', authService.getStoredUsers());
  
  // Test sign in with no users
  console.log('\n--- Testing sign in with no users ---');
  const signInResult1 = await authService.signIn('test@example.com', 'password');
  console.log('Sign in result:', signInResult1);
  
  // Test sign up
  console.log('\n--- Testing sign up ---');
  const signUpResult = await authService.signUp('test@example.com', 'password123', 'Test Parent', 'parent', '555-1234');
  console.log('Sign up result:', signUpResult);
  
  // Check users after signup
  console.log('Users after signup:', authService.getStoredUsers());
  
  // Test successful sign in
  console.log('\n--- Testing successful sign in ---');
  const signInResult2 = await authService.signIn('test@example.com', 'password123');
  console.log('Sign in result:', signInResult2);
  
  // Test wrong password
  console.log('\n--- Testing wrong password ---');
  const signInResult3 = await authService.signIn('test@example.com', 'wrongpassword');
  console.log('Sign in result:', signInResult3);
  
  // Test nonexistent user
  console.log('\n--- Testing nonexistent user ---');
  const signInResult4 = await authService.signIn('notfound@example.com', 'password123');
  console.log('Sign in result:', signInResult4);
}

testAuth().catch(console.error);
