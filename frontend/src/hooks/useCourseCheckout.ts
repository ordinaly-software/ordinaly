import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export function useCourseCheckout() {
  const [loading, setLoading] = useState(false);

  const startCheckout = async (courseId: number, onSuccess?: () => void) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;
      const response = await fetch(`${baseUrl}/api/courses/courses/${courseId}/create-checkout-session/`, {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      if (response.ok && data.checkout_url) {
        // Paid course: redirect to Stripe Checkout
        window.location.href = data.checkout_url;
        toast.success('Redirigido a Stripe para completar el pago.');
        if (onSuccess) onSuccess();
      } else if (response.ok && data.enrolled) {
        // Free course: enrolled directly
        toast.success('¡Inscripción completada con éxito!');
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.detail || 'Error inesperado en el proceso de inscripción.');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error de red al procesar la inscripción.');
    }
    setLoading(false);
  };

  return { startCheckout, loading };
}
