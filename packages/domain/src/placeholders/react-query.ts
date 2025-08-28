// Placeholder for @tanstack/react-query
import { useCallback, useState } from "react";

export interface QueryResult<T> {
  data?: T;
  error?: Error;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

export const useQuery = <T>(
  _key: string | string[],
  fn: () => Promise<T>,
): QueryResult<T> => {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const result = await fn();
      setData(result);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Query failed"));
    } finally {
      setIsLoading(false);
    }
  }, [fn]);

  return {
    data,
    error,
    isLoading,
    isError: Boolean(error),
    refetch,
  };
};

export const useMutation = <T, V>(fn: (variables: V) => Promise<T>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const mutate = useCallback(
    async (variables: V) => {
      try {
        setIsLoading(true);
        setError(undefined);
        return await fn(variables);
      } catch (error) {
        const error = error instanceof Error ? error : new Error("Mutation failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fn],
  );

  return {
    mutate,
    isLoading,
    error,
    isError: Boolean(error),
  };
};
