// Bootstraps the FIRST admin (or re-sends an invite) without needing to be logged in:
//   npm run invite-admin -- you@example.com
import dotenv from 'dotenv';
dotenv.config();

const { inviteAdmin } = await import('../server/admin.js');
const email = process.argv[2];
if (!email) {
  console.error('Usage: npm run invite-admin -- someone@example.com');
  process.exit(1);
}
const result = await inviteAdmin({ email, invitedBy: 'cli' });
console.log(result.ok ? `✔ ${result.message}` : `✖ ${result.message}`);
process.exit(result.ok ? 0 : 1);
