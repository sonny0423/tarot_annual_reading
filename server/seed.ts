import bcrypt from "bcryptjs";
import { getUserByEmail, createEmailUser, updateUserRole } from "./db";

interface SeedAccount {
  username: string;
  password: string;
  name: string;
  role: "user" | "admin";
}

// Default accounts to seed on startup
const DEFAULT_ACCOUNTS: SeedAccount[] = [
  {
    username: "richseed",
    password: "Tarot0919",
    name: "richseed",
    role: "admin",
  },
];

export async function seedDefaultAccounts() {
  for (const account of DEFAULT_ACCOUNTS) {
    try {
      let user = await getUserByEmail(account.username);

      if (!user) {
        const passwordHash = await bcrypt.hash(account.password, 12);
        await createEmailUser(account.username, passwordHash, account.name);
        console.log(`[Seed] Created default account: ${account.username}`);
        user = await getUserByEmail(account.username);
      }

      // Ensure the account has the correct role
      if (user && user.role !== account.role) {
        await updateUserRole(user.id, account.role);
        console.log(`[Seed] Updated role for ${account.username} to ${account.role}`);
      }
    } catch (err) {
      console.error(`[Seed] Failed to seed account ${account.username}:`, err);
    }
  }
}
