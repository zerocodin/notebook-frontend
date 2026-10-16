import toast from 'react-hot-toast';

export const showSuccess = (msg) => toast.success(msg);
export const showError = (msg) => toast.error(msg);
export const showInfo = (msg) => toast(msg);

// Extract message from an Axios error (falls back to a generic string)
export function toastApiError(err, fallback = 'Something went wrong') {
  const msg = err?.response?.data?.message || err?.message || fallback;
  toast.error(msg);
}

export function toastApiSuccess(res, fallback = 'Done') {
  const msg = res?.data?.message || fallback;
  toast.success(msg);
}