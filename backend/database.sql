-- MissionView Database Schema
-- Creates the database and tables for the MissionView application.
-- Compatible with the structure used in the Express REST API.

-- Set character set and collation
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Create Database (Run manually if it doesn't exist, or uncomment)
CREATE DATABASE IF NOT EXISTS `missionview_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `missionview_db`;

-- --------------------------------------------------------

--
-- Table structure for table `users`
-- Stores user accounts (shoppers and admins).
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL COMMENT 'Hashed password',
  `role` ENUM('shopper', 'admin') NOT NULL DEFAULT 'shopper',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `telephone` VARCHAR(50) NULL DEFAULT NULL,
  `city` VARCHAR(100) NULL DEFAULT NULL,
  `motivation` TEXT NULL DEFAULT NULL,
  `birth_year` INT NULL DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other', 'prefer_not_say') NULL DEFAULT 'prefer_not_say',
  `cv_url` VARCHAR(512) NULL DEFAULT NULL COMMENT 'URL to the CV file',
  `profile_pic_url` VARCHAR(512) NULL DEFAULT NULL COMMENT 'URL to the profile picture',
  `registration_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_missions` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Count of approved missions',
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`),
  INDEX `idx_user_status` (`status`)
) ENGINE=InnoDB COMMENT='Stores user accounts (shoppers, admins)';

-- --------------------------------------------------------

--
-- Table structure for table `missions`
-- Stores details about each mystery shopping mission.
--

DROP TABLE IF EXISTS `missions`;
CREATE TABLE `missions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `deadline` TIMESTAMP NOT NULL,
  `reward` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `location` VARCHAR(255) NOT NULL COMMENT 'Can be address or Lat,Lng string',
  `category` VARCHAR(100) NOT NULL,
  `business_name` VARCHAR(255) NOT NULL COMMENT 'Name of the business being evaluated',
  `status` ENUM('available', 'assigned', 'submitted', 'approved', 'refused') NOT NULL DEFAULT 'available',
  `created_by` INT NULL COMMENT 'Admin user ID who created the mission',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `survey_questions` JSON NULL COMMENT 'JSON array storing survey question structure',
  INDEX `idx_mission_status` (`status`),
  INDEX `idx_mission_category` (`category`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Stores details about each mystery shopping mission';

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
-- Links users (shoppers) to missions they have applied for or been assigned to.
--

DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `mission_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `status` ENUM('pending', 'assigned', 'completed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Status of the assignment/application itself (might differ from mission status)',
    `applied_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the user applied or was assigned',
    `assigned_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when assignment was confirmed (if applicable)',
    UNIQUE KEY `uq_mission_user_assignment` (`mission_id`, `user_id`),
    INDEX `idx_assignment_user` (`user_id`),
    INDEX `idx_assignment_status` (`status`),
    FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Links shoppers to missions (applications/assignments)';


-- --------------------------------------------------------

--
-- Table structure for table `reports`
-- Stores the submitted reports from shoppers for specific missions.
--

DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mission_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `answers` JSON NOT NULL COMMENT 'JSON object storing the answers keyed by question ID/type',
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('submitted', 'approved', 'refused') NOT NULL DEFAULT 'submitted',
  `refusal_reason` TEXT NULL DEFAULT NULL COMMENT 'Reason provided by admin if report is refused',
  INDEX `idx_report_mission` (`mission_id`),
  INDEX `idx_report_user` (`user_id`),
  INDEX `idx_report_status` (`status`),
  -- Unique constraint to prevent duplicate reports for the same user/mission (can be adjusted if re-submission updates)
  UNIQUE KEY `uq_report_mission_user` (`mission_id`, `user_id`),
  FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Stores submitted mission reports from shoppers';

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
-- Stores notifications for users.
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` VARCHAR(50) NOT NULL COMMENT 'e.g., MISSION_ASSIGNED, REPORT_APPROVED, REPORT_REFUSED, DEADLINE_REMINDER',
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `related_mission_id` INT NULL DEFAULT NULL,
  `related_report_id` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notification_user` (`user_id`),
  INDEX `idx_notification_read_status` (`user_id`, `is_read`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`related_mission_id`) REFERENCES `missions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`related_report_id`) REFERENCES `reports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Stores user notifications';

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
-- Stores ratings given (e.g., admin rating shopper performance based on report). This table is currently unused by the API.
--

DROP TABLE IF EXISTS `ratings`;
CREATE TABLE `ratings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `report_id` INT NOT NULL COMMENT 'Report being rated',
  `rated_by_user_id` INT NOT NULL COMMENT 'User giving the rating (e.g., admin)',
  `rated_user_id` INT NOT NULL COMMENT 'User being rated (e.g., shopper)',
  `score` TINYINT UNSIGNED NOT NULL COMMENT 'Rating score (e.g., 1-5)',
  `feedback` TEXT NULL DEFAULT NULL COMMENT 'Optional feedback text',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_rating_report` (`report_id`),
  INDEX `idx_rating_rated_user` (`rated_user_id`),
  FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`rated_by_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`rated_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Stores ratings (e.g., admin rating shopper performance)';


-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
-- Stores chat messages between users and admins.
--

DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT NOT NULL COMMENT 'User ID of the sender',
  `recipient_id` VARCHAR(50) NOT NULL COMMENT 'User ID of the recipient, or special value like "admin_room"',
  `message_text` TEXT NOT NULL,
  `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE, -- Track read status if needed
  INDEX `idx_chat_recipient` (`recipient_id`),
  INDEX `idx_chat_sender` (`sender_id`),
  INDEX `idx_chat_sent_at` (`sent_at`),
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
  -- No foreign key for recipient_id as it can be a user ID or 'admin_room'
) ENGINE=InnoDB COMMENT='Stores chat messages';

-- --------------------------------------------------------


-- Restore original settings
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
