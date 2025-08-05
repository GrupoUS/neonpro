/**
 * Mock for react-hot-toast library
 */

const toast = jest.fn();
toast.success = jest.fn();
toast.error = jest.fn();
toast.loading = jest.fn();
toast.dismiss = jest.fn();
toast.remove = jest.fn();
toast.promise = jest.fn();

const Toaster = jest.fn(() => null);

module.exports = {
  toast,
  Toaster,
  default: {
    toast,
    Toaster,
  },
};
