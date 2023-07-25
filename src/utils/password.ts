import { compare, genSalt, hash } from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await genSalt(10);
  return hash(password, salt);
}

export async function comparePasswords(
  enteredPassword: string,
  storedPassword: string,
): Promise<boolean> {
  return compare(enteredPassword, storedPassword);
}

