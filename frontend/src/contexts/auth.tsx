import { createContext, createSignal, useContext } from "solid-js";
import { isAccessTokenValid, removeAccessToken, saveAccessToken } from "../services/accessToken";
import { authLogin } from "../services/auth";

type AuthContextValue = {
  isAuthenticated: () => boolean;
  login: (username: string, password: string) => Promise<any>;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue>();

export const AuthProvider = (props: any) => {
  const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(isAccessTokenValid());

  const login = async (username: string, password: string): Promise<any> => {
    try {
      const json = await authLogin(username, password);
      if (json?.success) {
        saveAccessToken(json.payload.accessToken);
        setIsAuthenticated(true);
      }
      return json;
    } catch (error) {
      console.error('ERROR - login():', error);
      throw error;
    }
  };

  const clearAuth = (): void => {
    removeAccessToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, clearAuth }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => useContext(AuthContext);
