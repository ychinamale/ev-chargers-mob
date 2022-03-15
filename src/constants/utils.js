/** Debounce function
 * This function tracks the timeout using refs so that the value persists between component renders
 * @param {*} func the function to be run after a delay
 * @param {*} delay the delay in milliseconds
 * @param {*} ref used to persist the timeoutID
 */
export const debounceWithRef = (func, delay, ref) => {
  clearTimeout(ref.current);
  ref.current = setTimeout(func, delay);
}