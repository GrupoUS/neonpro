import { useState } from "react";

export default function usePlaceholder() {
  const [value, setValue] = useState();
  return { value, setValue };
}
