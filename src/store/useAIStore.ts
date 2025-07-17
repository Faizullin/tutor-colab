import { create } from "zustand";

interface CodeState {
  code: string;
  codeForConversion: string;
  setCode: (code: string) => void;
  setCodeForConversion: (codeForConversion: string) => void;
}

export const useAIStore = create<CodeState>((set) => ({
  code: "",  
  codeForConversion: "",  
  setCode: (code) => set({ code }),
  setCodeForConversion: (codeForConversion) => set({ codeForConversion }),
}));
