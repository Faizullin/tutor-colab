import { useState } from "react";

export function useControlDialog<T = any>(value?: T) {
  const [data, setData] = useState<T | undefined>(value);
  const [open, setOpen] = useState(false);
  const openWithData = (data?: T) => {
    setData(data);
    setOpen(true);
  };
  return {
    isOpen: open,
    data,
    setData,
    openWithData,
    close: () => {
      setOpen(false);
    },
  };
}
