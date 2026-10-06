// Local Storage Authentication Service (No Firebase Required)

const STORAGE_KEY = 'auth_user';
const USERS_KEY = 'registered_users';

// Get registered users from localStorage
const getRegisteredUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save registered users to localStorage
const saveRegisteredUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Sign up with email and password
export const signUpLocal = (email, password, displayName) => {
  try {
    const users = getRegisteredUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return {
        success: false,
        error: 'Email already registered'
      };
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, this should be hashed!
      displayName: displayName || email.split('@')[0],
      photoURL: null,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    saveRegisteredUsers(users);
    
    // Auto sign in
    const userSession = { ...newUser };
    delete userSession.password; // Don't store password in session
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));
    
    return {
      success: true,
      user: userSession
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Sign in with email and password
export const signInLocal = (email, password) => {
  try {
    const users = getRegisteredUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }
    
    // Create session
    const userSession = { ...user };
    delete userSession.password;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));
    
    return {
      success: true,
      user: userSession
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Sign out
export const signOutLocal = () => {
  localStorage.removeItem(STORAGE_KEY);
  return { success: true };
};

// Get current user from localStorage
export const getCurrentUserLocal = () => {
  const user = localStorage.getItem(STORAGE_KEY);
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticatedLocal = () => {
  return !!getCurrentUserLocal();
};

// Made with Bob