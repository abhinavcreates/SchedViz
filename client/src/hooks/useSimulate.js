/**
 * useSimulate — custom hook for running simulations.
 * Handles loading state, error state, and result state.
 */
import { useState } from 'react';
import apiClient from '../api/client';

export function useSimulate(endpoint) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const simulate = async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await apiClient.post(endpoint, payload);
      setResult(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Simulation failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setError(null); };

  return { result, loading, error, simulate, reset };
}
