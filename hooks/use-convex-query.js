import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useConvexQuery = (query, ...args) => {
  // NOTE: if the query function throws server-side, useQuery re-throws it
  // synchronously during THIS render — it never resolves to an `undefined`/
  // error value we could catch below. React aborts the render and looks for
  // the nearest error.js boundary (see app/error.jsx). There is no way to
  // "catch" a Convex query error inside this hook; a try/catch around
  // setState here can never fire, so we don't pretend to have one.
  const result = useQuery(query, ...args);
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (result === undefined) {
      setIsLoading(true);
    } else {
      setData(result);
      setIsLoading(false);
    }
  }, [result]);

  return {
    data,
    isLoading,
    // Always null: query errors surface via throw + error.js, not a value.
    // Kept in the return shape so existing `{ error }` destructuring doesn't break.
    error: null,
  };
};

export const useConvexMutation = (mutation) => {
  const mutationFn = useMutation(mutation);
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mutationFn(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};
