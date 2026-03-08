-- Step 1: Expand enum to include both old and new values
ALTER TABLE `complaints` MODIFY COLUMN `complaint_type` enum('damage','wash','dirt','delay','lost_item','overcharge','staff','other') NOT NULL;

-- Step 2: Migrate existing data
UPDATE `complaints` SET `complaint_type` = 'dirt' WHERE `complaint_type` = 'wash';
UPDATE `complaints` SET `complaint_type` = 'other' WHERE `complaint_type` = 'lost_item';

-- Step 3: Shrink enum to final values only
ALTER TABLE `complaints` MODIFY COLUMN `complaint_type` enum('damage','dirt','delay','overcharge','staff','other') NOT NULL;
