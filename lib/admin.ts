export const ADMIN_EMAILS = ["asfandiyorovdilyorbek@gmail.com"];

export const isAdminEmail = (email: string) => {
  return ADMIN_EMAILS.includes(email);
};