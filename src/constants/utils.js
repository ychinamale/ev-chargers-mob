let debounceTimerID;

// TODO: Rethink debounce implementation - doesn't clear previous timeouts in fn component
// Maybe move debounceTimerID into component as a ref buddy 🤷🏽‍♂️
export const debounce = (func, delay) => {
  clearTimeout(debounceTimerID);
  debounceTimerID = setTimeout(func, delay);
}