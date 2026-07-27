import bcrypt from "bcryptjs";
import { getUserByEmail, createEmailUser } from "./db";

interface SeedAccount {
  username: string;
  password: string;
  name: string;
}

// Default accounts to seed on startup
const DEFAULT_ACCOUNTS: SeedAccount[] = [
  {
    username: "richseed",
    password: "Tarot0919",
    name: "richseed",
  },
];

export async function seedDefaultAccounts() {
  for (const account of DEFAULT_ACCOUNTS) {
    try {
      const existing = await getUserByEmail(account.username);
      if (existing) {
        // Account already exists, skip
        continue;
      }

      const passwordHash = await bcrypt.hash(account.password, 12);
      await createEmailUser(account.username, passwordHash, account.name);
      console.log(`[Seed] Created default account: ${account.username}`);
    } catch (err) {
      console.error(`[Seed] Failed to create account ${account.username}:`, err);
    }
  }
}
