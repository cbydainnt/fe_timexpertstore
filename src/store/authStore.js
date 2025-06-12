import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '../config/axiosConfig';

// Giải mã payload từ JWT (chỉ dùng để đọc exp, email…)
const decodeToken = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
};

// CustomStorage để chọn localStorage hoặc sessionStorage dựa trên rememberMeActive
const customStorage = {
  getItem: (name) => {
    const localData = localStorage.getItem(name);
    if (localData) {
      console.log("Rehydrating from localStorage");
      return localData;
    }
    const sessionData = sessionStorage.getItem(name);
    if (sessionData) {
      console.log("Rehydrating from sessionStorage");
      return sessionData;
    }
    return null;
  },
  setItem: (name, value) => {
    try {
      const parsed = JSON.parse(value);
      const remember = parsed?.state?.rememberMeActive ?? false;
      console.log(`Persisting state with rememberMe: ${remember}`);
      if (remember) {
        localStorage.setItem(name, value);
        sessionStorage.removeItem(name);
      } else {
        sessionStorage.setItem(name, value);
        localStorage.removeItem(name);
      }
    } catch (e) {
      console.error("Error in customStorage.setItem:", e);
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
    console.log("Removed auth state from storage.");
  },
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // --- state ---
      token: null,
      user: null,
      isAuthenticated: false,
      rememberMeActive: false,

      // --- actions ---

      /**
       * Lưu JWT và tự động fetch profile.
       * @param {string} token 
       * @param {boolean} rememberMe 
       */
      setToken: async (token, rememberMe = false) => {
        // 1) gắn header cho apiClient
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // 2) lưu vào state
        set({ token, isAuthenticated: true, rememberMeActive: rememberMe });
        console.log("setToken:", { rememberMe });

        // 3) fetch profile
        try {
          const resp = await apiClient.get('/users/profile');
          set({ user: resp.data });
          console.log("Fetched profile:", resp.data);
        } catch (err) {
          console.error("Failed to fetch profile in setToken:", err);
        }
      },
      // setToken: async (token) => {
      //   localStorage.setItem("token", token);
      //   try {
      //     const response = await axios.get("/api/users/profile", {
      //       headers: { Authorization: `Bearer ${token}` }
      //     });
      //     set({ user: response.data, isAuthenticated: true });
      //   } catch (error) {
      //     localStorage.removeItem("token");
      //     set({ user: null, isAuthenticated: false });
      //     throw error;
      //   }
      // },

      /**
       * Đăng nhập bằng username/password
       */
      login: async (username, password, rememberMe = false) => {
        try {
          const { data } = await apiClient.post('/users/login', { username, password });
          const { token, user } = data;
          if (!token || !user) throw new Error("Invalid login response");

          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ token, user, isAuthenticated: true, rememberMeActive: rememberMe });
          console.log('Login successful:', { user, rememberMe });
          return { success: true };
        } catch (error) {
          console.error("Login failed:", error);
          set({ token: null, user: null, isAuthenticated: false, rememberMeActive: false });
          const msg = error.response?.data?.message || error.message;
          return { success: false, error: msg };
        }
      },

      /** Đăng xuất */
      logout: () => {
        delete apiClient.defaults.headers.common['Authorization'];
        set({ token: null, user: null, isAuthenticated: false, rememberMeActive: false });
        console.log("Logged out");
      },

      /** Cập nhật profile local */
      updateUser: (updated) => {
        set((state) =>
          state.user ? { user: { ...state.user, ...updated } } : {}
        );
        console.log("User updated in store:", updated);
      },

      /** Kiểm tra token khi hydrate */
      checkAuthState: () => {
        const token = get().token;
        if (token) {
          const decoded = decodeToken(token);
          if (decoded && decoded.exp * 1000 > Date.now()) {
            if (!get().isAuthenticated) set({ isAuthenticated: true });
          } else {
            get().logout();
          }
        } else if (get().isAuthenticated) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => {
        console.log("Auth Store hydration started...");
        return (state, err) => {
          if (err) console.error("Hydration error:", err);
          else if (state) {
            console.log("Hydration done, checking auth state...");
            state.checkAuthState();
          }
        };
      },
    }
  )
);
