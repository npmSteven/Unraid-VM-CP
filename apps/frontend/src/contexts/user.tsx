import { Accessor, createContext, createSignal, useContext } from "solid-js";
import { getUserApi } from "../services/users";

type UserContextValue = {
  getUser: () => Promise<any>
  user: () => any
  clearUser: () => void
  users: () => any[]
  isUnraidUser: () => boolean
  isLoading: Accessor<boolean>
};

const UserContext = createContext<UserContextValue>();

export const UserProvider = (props: any) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [user, setUser] = createSignal(null);
  const [isUnraidUser, setIsUnraidUser] = createSignal(false);
  const [users, setUsers] = createSignal([]);

  const getUser = async (): Promise<any> => {
    try {
      setIsLoading(true);
      const json = await getUserApi();
      if (json?.success) {
        setUser(json.payload.user);
        if (json.payload.user?.isUnraidUser) {
          setIsUnraidUser(json.payload.user.isUnraidUser);
          setUsers(json.payload.users);
        } else {
          setIsUnraidUser(false);
          setUsers([]);
        }
      }
      setIsLoading(false);
      return json;
    } catch (error) {
      setIsLoading(false);
      console.error('ERROR - getUser():', error);
      throw error;
    }
  };

  const clearUser = () => {
    setUser(null);
    setUsers([]);
    setIsUnraidUser(false);
  }

  return (
    <UserContext.Provider value={{ user, getUser, users, isUnraidUser, clearUser, isLoading }}>
      {props.children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => useContext(UserContext);
