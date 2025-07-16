import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface SettingsContextType {
  showMemory: boolean;
  setShowMemory: Dispatch<SetStateAction<boolean>>;
}
const SettingsContext = createContext<SettingsContextType>({
  showMemory: false,
  setShowMemory: () => {
    throw new Error("setShowMemory function not implemented");
  },
});

export const SettingsContextProvider = ({ children }: PropsWithChildren) => {
  const [showMemory, setShowMemory] = useState(false);

  return (
    <SettingsContext.Provider value={{ showMemory, setShowMemory }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      "useSettingsContext must be used within a SettingsContextProvider"
    );
  }
  return context;
};
