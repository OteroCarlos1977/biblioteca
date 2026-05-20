import { sileo } from 'sileo';

const toastOptions = {
  position: 'top-right',
  duration: 3600,
};

export const notifySuccess = (title, description) => {
  sileo.success({
    ...toastOptions,
    title,
    description,
  });
};

export const notifyError = (title, description) => {
  sileo.error({
    ...toastOptions,
    title,
    description,
    duration: 5200,
  });
};

export const notifyWarning = (title, description) => {
  sileo.warning({
    ...toastOptions,
    title,
    description,
  });
};

export const confirmWithToast = ({ title, description, confirmText, onConfirm }) => {
  const toastId = sileo.action({
    ...toastOptions,
    title,
    description,
    duration: null,
    button: {
      title: confirmText,
      onClick: () => {
        sileo.dismiss(toastId);
        onConfirm();
      },
    },
  });
};
