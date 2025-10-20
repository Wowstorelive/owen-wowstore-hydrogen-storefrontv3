export const useDirection = () => {
  if (typeof document === 'undefined') {
    return 'lrt';
  }
  const dirElement: any = document.querySelector('html');
  const dir = dirElement.getAttribute('dir');
  return dir ? dir : 'ltr';
};
