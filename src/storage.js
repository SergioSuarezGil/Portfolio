export const getStoredPreference = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch (_error) {
    return null;
  }
};

export const setStoredPreference = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (_error) {
    // Ignore storage errors (private mode, blocked storage, etc.)
  }
};
