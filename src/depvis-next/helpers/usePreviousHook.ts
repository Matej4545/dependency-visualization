import { useEffect, useRef } from "react";

/**
 * Hook for accessing previous value of an object.
 * Can be used when comparing a change in an object property
 * @param value Which object to watch
 * @returns Previous value of the object
 */
function usePrevious<T>(value): T {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
export default usePrevious;
