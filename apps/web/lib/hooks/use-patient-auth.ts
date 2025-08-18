import { useState } from "react";

export default function usePlaceholder() {
  const [value, setValue] = useState(null);
  return { value, setValue };
}
