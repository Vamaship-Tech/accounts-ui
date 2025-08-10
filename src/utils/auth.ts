export const clearAllAuthenticationData = () => {
    const authKeys = [
        'api_key',
        'user_info', 
        'auth_token',
        'access_token',
        'token',
        'user',
        'refresh_token',
        'jwt_token',
        'session_token',
        'auth_timestamp'
    ];
    
    authKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
    });
    
    authKeys.forEach(key => {
        if (sessionStorage.getItem(key)) {
            sessionStorage.removeItem(key);
        }
    });
    
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    const remainingKeys = authKeys.filter(key => 
        localStorage.getItem(key) || sessionStorage.getItem(key)
    );
};

export const isFromEcom3uiLogout = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromEcom3ui = urlParams.get('from') === 'ecom3-ui';
    const hasAuthTokens = urlParams.has('token') || urlParams.has('api_key') || urlParams.has('user_info');
    
    return fromEcom3ui && !hasAuthTokens;
};

export const setAuthenticationData = (apiKey: string, userInfo: string) => {
    const timestamp = Date.now();
    localStorage.setItem('api_key', apiKey);
    localStorage.setItem('user_info', userInfo);
    localStorage.setItem('auth_timestamp', timestamp.toString());
};

export const isAuthenticationExpired = (): boolean => {
    const timestamp = localStorage.getItem('auth_timestamp');
    
    if (!timestamp) {
        return true;
    }
    
    const authTime = parseInt(timestamp);
    const now = Date.now();
    const hoursSinceAuth = (now - authTime) / (1000 * 60 * 60);
    
    if (hoursSinceAuth > 24) {
        return true;
    }
    
    return false;
};

export const isAuthenticationValid = (): boolean => {
    const apiKey = localStorage.getItem('api_key');
    const userInfo = localStorage.getItem('user_info');
    
    const hasValidApiKey = !!(apiKey && 
                          apiKey !== 'undefined' && 
                          apiKey !== 'null' && 
                          apiKey.trim() !== '' &&
                          apiKey.length > 20);
    
    let hasValidUserInfo = false;
    if (userInfo && userInfo !== 'undefined' && userInfo !== 'null') {
        try {
            const parsed = JSON.parse(userInfo);
            hasValidUserInfo = !!(parsed && 
                             typeof parsed === 'object' &&
                             (parsed.id || parsed.user_id || parsed.email));
        } catch (error) {
            hasValidUserInfo = false;
        }
    }
    
    const isExpired = isAuthenticationExpired();
    
    const isValid = hasValidApiKey && hasValidUserInfo && !isExpired;
    
    return isValid;
}; 