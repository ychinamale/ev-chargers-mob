let debounceTimerID;
export const debounce = (func, delay) => {
  clearTimeout(debounceTimerID);
  debounceTimerID = setTimeout(func, delay);
}