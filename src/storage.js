export const getStoredPreference = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const setStoredPreference = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors (private mode, blocked storage, etc.)
  }
};
