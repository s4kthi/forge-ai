-- Preserve legacy identities without making them eligible to log in.
BEGIN;
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
-- Existing spellings remain unchanged; equivalent emails cannot be registered twice.
CREATE UNIQUE INDEX "User_normalized_email_key" ON "User" (lower(btrim("email")));
ALTER TABLE "Organization" ADD COLUMN "demoClaimedAt" TIMESTAMPTZ(3);

CREATE TABLE "Session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ(3),
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
COMMIT;
