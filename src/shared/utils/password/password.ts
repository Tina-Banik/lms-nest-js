import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const slatRounds = 10;
  return bcrypt.hash(password, slatRounds);
}
