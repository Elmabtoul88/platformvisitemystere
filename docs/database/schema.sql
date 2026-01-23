-- MissionView Database Schema
-- Creates the database and tables for the MissionView application.

-- Create Database (Optional - Run this manually if the database doesn't exist)
-- CREATE DATABASE IF NOT EXISTS missionview_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE missionview_db;

-- -----------------------------------------------------
-- Table `users`
-- Stores user information for both shoppers and admins.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL COMMENT 'Hashed password',
  `role` ENUM('shopper', 'admin') NOT NULL DEFAULT 'shopper',
  `status` ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active' COMMENT 'User account status',
  `telephone` VARCHAR(20) NULL DEFAULT NULL,
  `city` VARCHAR(100) NULL DEFAULT NULL,
  `motivation` TEXT NULL DEFAULT NULL COMMENT 'Shopper motivation/bio',
  `birth_year` SMALLINT NULL DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other', 'prefer_not_say') NULL DEFAULT 'prefer_not_say',
  `cv_url` VARCHAR(512) NULL DEFAULT NULL COMMENT 'URL path to the uploaded CV file',
  `profile_pic_url` VARCHAR(512) NULL DEFAULT NULL COMMENT 'URL path to the profile picture',
  `registration_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `completed_missions` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Counter for approved missions completed by shopper',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB
COMMENT = 'Stores user accounts';


-- -----------------------------------------------------
-- Table `missions`
-- Stores details about each mystery shopping mission.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `missions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `business_name` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL COMMENT 'Can be address or lat,lng coordinates',
  `category` VARCHAR(100) NULL DEFAULT NULL,
  `deadline` DATETIME NOT NULL,
  `reward` DECIMAL(10,2) NOT NULL COMMENT 'Payment amount for completing the mission',
  `status` ENUM('available', 'assigned', 'submitted', 'approved', 'refused', 'cancelled') NOT NULL DEFAULT 'available',
  `created_by` INT UNSIGNED NULL COMMENT 'Admin user ID who created the mission',
  `survey_questions` JSON NULL DEFAULT NULL COMMENT 'JSON array storing survey questions structure',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_missions_users_idx` (`created_by` ASC) VISIBLE,
  INDEX `idx_missions_status` (`status` ASC) VISIBLE,
  INDEX `idx_missions_category` (`category` ASC) VISIBLE,
  CONSTRAINT `fk_missions_users`
    FOREIGN KEY (`created_by`)
    REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'Stores mission details';


-- -----------------------------------------------------
-- Table `assignments`
-- Links users (shoppers) to missions they have applied for or are assigned to.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `mission_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `status` ENUM('pending', 'assigned', 'completed', 'cancelled') NOT NULL DEFAULT 'assigned' COMMENT 'Status of the user assignment for this mission',
  `applied_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_at` TIMESTAMP NULL DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_assignments_missions_idx` (`mission_id` ASC) VISIBLE,
  INDEX `fk_assignments_users_idx` (`user_id` ASC) VISIBLE,
  UNIQUE INDEX `uq_mission_user_assignment` (`mission_id` ASC, `user_id` ASC) VISIBLE COMMENT 'Ensure a user can only be assigned once per mission',
  CONSTRAINT `fk_assignments_missions`
    FOREIGN KEY (`mission_id`)
    REFERENCES `missions` (`id`)
    ON DELETE CASCADE -- If mission is deleted, remove assignments
    ON UPDATE CASCADE,
  CONSTRAINT `fk_assignments_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE -- If user is deleted, remove assignments
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'Tracks mission assignments to users';


-- -----------------------------------------------------
-- Table `reports`
-- Stores the submitted reports from shoppers for completed missions.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `mission_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `answers` JSON NOT NULL COMMENT 'JSON object containing answers keyed by question ID/type',
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('submitted', 'approved', 'refused') NOT NULL DEFAULT 'submitted',
  `refusal_reason` TEXT NULL DEFAULT NULL COMMENT 'Reason provided by admin if report is refused',
  `reviewed_by` INT UNSIGNED NULL COMMENT 'Admin user ID who reviewed the report',
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_reports_missions_idx` (`mission_id` ASC) VISIBLE,
  INDEX `fk_reports_users_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_reports_admin_reviewer_idx` (`reviewed_by` ASC) VISIBLE,
  INDEX `idx_reports_status` (`status` ASC) VISIBLE,
  UNIQUE INDEX `uq_report_mission_user` (`mission_id` ASC, `user_id` ASC) VISIBLE COMMENT 'Allow only one report per user per mission (handle updates)',
  CONSTRAINT `fk_reports_missions`
    FOREIGN KEY (`mission_id`)
    REFERENCES `missions` (`id`)
    ON DELETE CASCADE -- If mission is deleted, delete reports
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE -- If user is deleted, delete their reports
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_admin_reviewer`
    FOREIGN KEY (`reviewed_by`)
    REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
COMMENT = 'Stores submitted mission reports';


-- -----------------------------------------------------
-- Table `notifications` (Optional - For future implementation)
-- Stores notifications for users.
-- -----------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `notifications` (
--   `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
--   `user_id` INT UNSIGNED NOT NULL,
--   `type` ENUM('new_mission', 'deadline', 'report_approved', 'report_refused', 'message') NOT NULL,
--   `message` TEXT NOT NULL,
--   `related_entity_type` VARCHAR(50) NULL COMMENT 'e.g., mission, report, chat',
--   `related_entity_id` INT UNSIGNED NULL,
--   `is_read` TINYINT(1) NOT NULL DEFAULT 0,
--   `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (`id`),
--   INDEX `fk_notifications_users_idx` (`user_id` ASC) VISIBLE,
--   INDEX `idx_notifications_is_read` (`user_id` ASC, `is_read` ASC) VISIBLE,
--   CONSTRAINT `fk_notifications_users`
--     FOREIGN KEY (`user_id`)
--     REFERENCES `users` (`id`)
--     ON DELETE CASCADE
--     ON UPDATE CASCADE)
-- ENGINE = InnoDB
-- COMMENT = 'Stores user notifications';


-- -----------------------------------------------------
-- Table `chats` (Optional - For future implementation)
-- Stores chat messages between users (shopper and admin).
-- -----------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `chats` (
--   `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
--   `sender_id` INT UNSIGNED NOT NULL,
--   `receiver_id` INT UNSIGNED NOT NULL,
--   `message` TEXT NOT NULL,
--   `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   `is_read` TINYINT(1) NOT NULL DEFAULT 0,
--   PRIMARY KEY (`id`),
--   INDEX `fk_chats_sender_idx` (`sender_id` ASC) VISIBLE,
--   INDEX `fk_chats_receiver_idx` (`receiver_id` ASC) VISIBLE,
--   INDEX `idx_chats_read_status` (`receiver_id` ASC, `is_read` ASC) VISIBLE,
--   CONSTRAINT `fk_chats_sender`
--     FOREIGN KEY (`sender_id`)
--     REFERENCES `users` (`id`)
--     ON DELETE CASCADE
--     ON UPDATE CASCADE,
--   CONSTRAINT `fk_chats_receiver`
--     FOREIGN KEY (`receiver_id`)
--     REFERENCES `users` (`id`)
--     ON DELETE CASCADE
--     ON UPDATE CASCADE)
-- ENGINE = InnoDB
-- COMMENT = 'Stores chat messages';


-- Add any additional indexes or constraints as needed for performance or data integrity.
