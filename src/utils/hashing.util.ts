import * as bcrypt from 'bcrypt';

/**
 * Encrypts a password using bcrypt with automatic salt generation.
 * @param password - The plain text password to encrypt
 * @returns The encrypted password hash
 */
export const encryptPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  const encryptedPassword = bcrypt.hashSync(password, salt);

  return encryptedPassword;
};

/**
 * Validates a password against an encrypted password hash.
 * @param password - The plain text password to validate
 * @param encryptedPassword - The encrypted password hash to compare against
 * @returns True if the password matches, false otherwise
 */
export const validatePassword = (password: string, encryptedPassword: string) => {
  return bcrypt.compareSync(password, encryptedPassword);
};
