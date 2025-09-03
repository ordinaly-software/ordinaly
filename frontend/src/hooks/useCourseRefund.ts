import { useState } from 'react';
import { toast } from 'react-toastify';

export function useCourseRefund() {
  const [loading, setLoading] = useState(false);

  const requestRefund = async (courseId: number) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;
        const response = await fetch(`${baseUrl}/api/courses/courses/${courseId}/refund-course/`, {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('La cancelación y reembolso se han procesado correctamente.');
      } else {
        toast.error(data.detail || 'No se pudo procesar el reembolso.');
      }
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Error de red al solicitar el reembolso.');
    }
    setLoading(false);
  };

  return { requestRefund, loading };
}
