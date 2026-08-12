import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const slatRounds = 10;
  return bcrypt.hash(password, slatRounds);
}

export async function comparePassword(password:string, hashPassword:string):Promise<boolean> {
  return bcrypt.compare(password, hashPassword)
}