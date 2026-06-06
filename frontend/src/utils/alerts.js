import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const baseOptions = {
  confirmButtonColor: '#991b1b',
  cancelButtonColor: '#475569',
  background: '#fffaf5',
  color: '#1f2937',
  customClass: {
    popup: 'barber-alert-popup',
    title: 'barber-alert-title',
    confirmButton: 'barber-alert-confirm',
    cancelButton: 'barber-alert-cancel',
  },
};

export const showSuccess = (title, text = '') =>
  Swal.fire({
    ...baseOptions,
    icon: 'success',
    title,
    text,
    timer: 1800,
    showConfirmButton: false,
  });

export const showError = (title, text = '') =>
  Swal.fire({
    ...baseOptions,
    icon: 'error',
    title,
    text,
  });

export const showWarning = (title, text = '') =>
  Swal.fire({
    ...baseOptions,
    icon: 'warning',
    title,
    text,
  });

export const confirmAction = async ({
  title,
  text,
  confirmButtonText = 'Yes, continue',
}) => {
  const result = await Swal.fire({
    ...baseOptions,
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
  });

  return result.isConfirmed;
};
