import { useState, useCallback } from "react";
import { GenericStringInMemoryStorage, type GenericStringStorage } from "@/fhevm/GenericStringStorage";

export function useInMemoryStorage(): {
  storage: GenericStringStorage;
} {
  const [storage] = useState<GenericStringStorage>(() => new GenericStringInMemoryStorage());
  return { storage };
}

