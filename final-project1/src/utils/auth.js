export const signup = (userData) => {
    // Store user data in localStorage
    localStorage.setItem('user_profile', JSON.stringify(userData));
    // For simplicity in this demo, we also keep the email/password in a separate map or just check this object
    return userData;
};

export const login = (email, password) => {
    const storedUser = JSON.parse(localStorage.getItem('user_profile'));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
        localStorage.setItem('isAuthenticated', 'true');
        return storedUser;
    }
    return null;
};

export const logout = () => {
    localStorage.removeItem('isAuthenticated');
};

export const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
};

export const getUserProfile = () => {
    return JSON.parse(localStorage.getItem('user_profile'));
};
