export const UI_LOADING_TIMEOUT_MS = 3000;

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = UI_LOADING_TIMEOUT_MS,
  message = "This request took too long.",
) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeout);
        reject(error);
      });
  });
}
