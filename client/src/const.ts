export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Unauthenticated users are redirected to the landing page
export const getLoginUrl = () => {
  return "/welcome";
};
