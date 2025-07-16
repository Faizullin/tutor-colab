import { createContext, PropsWithChildren, useContext, useState } from "react";

type SettingsContextType = object
const SettingsContext = createContext<SettingsContextType>({});

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
