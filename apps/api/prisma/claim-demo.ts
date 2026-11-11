import { ApiError } from "../src/errors/api-error.ts";
import { disconnectDatabase } from "../src/services/database.ts";
import { claimDemoOrganization } from "../src/services/demo-claim.ts";
import { emailInput } from "../src/validation/auth.ts";

try {
  const email = emailInput.safeParse(process.argv[2]);
  if (!email.success || process.argv.length !== 3) {
    throw new ApiError(400, "Usage: npm run db:claim-demo -- <registered-email>");
  }
  await claimDemoOrganization(email.data);
  console.info("Demo organization ownership granted. Existing data was preserved.");
} catch (error) {
  console.error(error instanceof ApiError ? error.message : "Demo claim failed. Check local database configuration.");
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
