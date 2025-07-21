// src/hooks/useControlledToggle.ts
import { useCallback, useState } from "react";

// Define the shape of the options for the controlled hook
interface UseControlledHookOptions {
  /** The controlled value. If provided, the internal state will be ignored. */
  value?: boolean;
  /** Callback fired when the value would change. */
  onChange?: (newValue: boolean) => void;
  /** The initial uncontrolled value. Only used if `value` is not provided. */
  defaultValue?: boolean;
}

export function useControlledToggle(options: UseControlledHookOptions = {}) {
  const { value: controlledValue, onChange, defaultValue = false } = options;

  // Internal state for when the hook is "uncontrolled"
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  // Determine if the component is controlled
  const isControlled = controlledValue !== undefined;

  // The actual value to use: controlledValue if provided, otherwise uncontrolledValue
  const value = isControlled ? controlledValue : uncontrolledValue;

  // Create a setter function that respects the controlled/uncontrolled state
  const setValue = useCallback(
    (newValue: boolean) => {
      if (isControlled && onChange) {
        onChange(newValue); // If controlled, call the provided onChange
      } else if (!isControlled) {
        setUncontrolledValue(newValue); // If uncontrolled, update internal state
      }
    },
    [isControlled, onChange]
  );

  const toggle = useCallback(() => {
    setValue(!value);
  }, [setValue, value]);

  const setTrue = useCallback(() => {
    setValue(true);
  }, [setValue]);

  const setFalse = useCallback(() => {
    setValue(false);
  }, [setValue]);

  return { value, setValue, toggle, setTrue, setFalse };
}
