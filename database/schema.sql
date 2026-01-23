-- MissionView Database Schema
-- Creates the database and tables for the MissionView application.

-- Set character set and collation for compatibility
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Create Database (Optional - Run this manually or ensure it's uncommented if needed)
CREATE DATABASE IF NOT EXISTS `missionview_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `missionview_db`;

-- --------------------------------------------------------

--
-- Table structure for table `users`
-- Stores user accounts for both shoppers and administrators.
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for the user',
  `name` VARCHAR(255) NOT NULL COMMENT 'Full name of the user',
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email address, used for login',
  `password` VARCHAR(255) NOT NULL COMMENT 'Hashed password for the user account',
  `role` ENUM('shopper', 'admin') NOT NULL DEFAULT 'shopper' COMMENT 'Role of the user (shopper or admin)',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Status of the user account',
  `telephone` VARCHAR(20) DEFAULT NULL COMMENT 'User contact phone number',
  `city` VARCHAR(100) DEFAULT NULL COMMENT 'City where the user resides',
  `motivation` TEXT DEFAULT NULL COMMENT 'User motivation for being a mystery shopper',
  `birth_year` INT DEFAULT NULL COMMENT 'User birth year',
  `gender` ENUM('male', 'female', 'other', 'prefer_not_say') DEFAULT 'prefer_not_say' COMMENT 'User gender identity',
  `cv_url` VARCHAR(512) DEFAULT NULL COMMENT 'URL to the user uploaded CV/Resume file',
  `profile_pic_url` VARCHAR(512) DEFAULT NULL COMMENT 'URL to the user profile picture',
  `registration_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the user registered',
  `completed_missions` INT DEFAULT 0 COMMENT 'Count of successfully completed and approved missions (for shoppers)',
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`),
  INDEX `idx_user_status` (`status`)
) ENGINE=InnoDB COMMENT='Stores user accounts for shoppers and administrators';

-- --------------------------------------------------------

--
-- Table structure for table `missions`
-- Stores details about each mystery shopping mission.
--
CREATE TABLE IF NOT EXISTS `missions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for the mission',
  `title` VARCHAR(255) NOT NULL COMMENT 'Title of the mission',
  `description` TEXT NOT NULL COMMENT 'Detailed description of the mission tasks',
  `deadline` DATETIME NOT NULL COMMENT 'Deadline for completing the mission and submitting the report',
  `reward` DECIMAL(10, 2) NOT NULL COMMENT 'Payment amount for successfully completing the mission',
  `location` VARCHAR(255) NOT NULL COMMENT 'Location of the mission (Address or Lat,Lng)',
  `category` VARCHAR(100) DEFAULT NULL COMMENT 'Category of the mission (e.g., Restaurant, Retail)',
  `business_name` VARCHAR(255) DEFAULT NULL COMMENT 'Name of the business being evaluated',
  `status` ENUM('available', 'assigned', 'submitted', 'approved', 'refused') NOT NULL DEFAULT 'available' COMMENT 'Current status of the mission',
  `created_by` INT NOT NULL COMMENT 'ID of the admin user who created the mission',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the mission was created',
  `survey_questions` JSON DEFAULT NULL COMMENT 'JSON array storing the survey questions structure',
  INDEX `idx_mission_status` (`status`),
  INDEX `idx_mission_category` (`category`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE -- Ensure created_by references a valid user
) ENGINE=InnoDB COMMENT='Stores details about each mystery shopping mission';

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
-- Tracks which users are assigned to which missions.
--
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for the assignment',
  `mission_id` INT NOT NULL COMMENT 'ID of the assigned mission',
  `user_id` INT NOT NULL COMMENT 'ID of the user assigned to the mission',
  `status` ENUM('pending', 'assigned', 'completed', 'cancelled') NOT NULL DEFAULT 'assigned' COMMENT 'Status of the assignment (e.g., if admin assigns directly)',
  `applied_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the user applied or was assigned',
  INDEX `idx_assignment_mission_user` (`mission_id`, `user_id`), -- Index for quick lookups
  UNIQUE KEY `uq_assignment_mission_user` (`mission_id`, `user_id`), -- Prevent duplicate assignments
  FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Tracks mission assignments to users';

-- --------------------------------------------------------

--
-- Table structure for table `reports`
-- Stores the submitted reports from shoppers for missions.
--
CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for the report',
  `mission_id` INT NOT NULL COMMENT 'ID of the mission this report is for',
  `user_id` INT NOT NULL COMMENT 'ID of the user who submitted the report',
  `answers` JSON NOT NULL COMMENT 'JSON object containing the answers to the survey questions',
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the report was submitted',
  `status` ENUM('submitted', 'approved', 'refused') NOT NULL DEFAULT 'submitted' COMMENT 'Status of the report review',
  `refusal_reason` TEXT DEFAULT NULL COMMENT 'Reason provided by admin if the report is refused',
  INDEX `idx_report_mission_user` (`mission_id`, `user_id`), -- Index for quick lookups
  INDEX `idx_report_status` (`status`),
  FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Stores submitted mission reports from shoppers';

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
-- Stores chat messages between users (shoppers and admins).
--
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for the chat message',
  `sender_id` INT NOT NULL COMMENT 'ID of the user sending the message',
  `recipient_id` INT NOT NULL COMMENT 'ID of the user receiving the message (or a special ID for admin group)',
  `sender_role` ENUM('shopper', 'admin') NOT NULL COMMENT 'Role of the sender at the time of sending',
  `recipient_role` ENUM('shopper', 'admin') NOT NULL COMMENT 'Intended role of the recipient',
  `text` TEXT NOT NULL COMMENT 'Content of the chat message',
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the message was sent',
  `read_status` ENUM('unread', 'read') NOT NULL DEFAULT 'unread' COMMENT 'Read status of the message for the recipient',
  INDEX `idx_chat_sender_recipient` (`sender_id`, `recipient_id`),
  INDEX `idx_chat_recipient_read` (`recipient_id`, `read_status`),
  INDEX `idx_chat_timestamp` (`timestamp`),
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE -- Assuming recipient is always a specific user for now
) ENGINE=InnoDB COMMENT='Stores chat messages between users';

-- --------------------------------------------------------

-- Restore previous settings
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
