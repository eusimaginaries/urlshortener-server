export const validateUrl = (url: string): boolean => {
  const regex: RegExp = new RegExp('^https?:\/\/[a-zA-Z0-9.]*\.[a-z]*');
  return regex.test(url);
}

export const generateHash = (url: string): string => {
  // Just generate random string
  return Math.random().toString(36).substring(7);
}

export default { validateUrl, generateHash };
