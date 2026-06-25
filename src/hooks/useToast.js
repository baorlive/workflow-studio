/**
 * @module useToast
 * Convenience re-export of the useToast hook from ToastContext.
 *
 * Usage:
 *   import { useToast } from '@hooks/useToast';
 *   const { showToast } = useToast();
 *   showToast({ message: 'Done!', type: 'success' });
 */
export { useToast } from '../../contexts/ToastContext';
