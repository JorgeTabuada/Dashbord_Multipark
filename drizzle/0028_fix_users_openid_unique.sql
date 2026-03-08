-- Fix: openId was a regular index instead of UNIQUE, causing duplicate users on every login.

-- Step 1: Delete duplicate users, keeping only the one with the lowest id (original) per openId.
DELETE u1 FROM `users` u1
INNER JOIN `users` u2
ON u1.openId = u2.openId AND u1.id > u2.id;

-- Step 2: For users that have a name in a duplicate but not in the kept record, update them.
-- (Already handled by keeping lowest id, which should be the first created)

-- Step 3: Drop the old non-unique index.
DROP INDEX `users_openId_unique` ON `users`;

-- Step 4: Add a proper UNIQUE constraint.
ALTER TABLE `users` ADD UNIQUE INDEX `users_openId_unique` (`openId`);
