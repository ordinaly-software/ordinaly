import { useCourseCheckout } from '@/hooks/useCourseCheckout';

interface CheckoutButtonProps {
  courseId: number;
  label?: string;
  className?: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ courseId, label = 'Pagar', className, onSuccess, disabled }) => {
  const { startCheckout, loading } = useCourseCheckout();

  return (
    <button
      onClick={() => startCheckout(courseId, onSuccess)}
      disabled={loading || disabled}
      className={className}
    >
      {loading ? 'Procesando...' : label}
    </button>
  );
};

export default CheckoutButton;
