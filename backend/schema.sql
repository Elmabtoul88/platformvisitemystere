-- MissionView Database Schema
-- Creates the database and tables for the MissionView application.

-- Set character set and collation for compatibility
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Create Database (Optional - Run this manually if the database doesn't exist)
-- CREATE DATABASE IF NOT EXISTS `missionview_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `missionview_db`;

--
-- Table structure for table `users`
-- Stores user accounts for shoppers and administrators.
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique user identifier',
  `name` VARCHAR(255) NOT NULL COMMENT 'User full name',
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email address (used for login)',
  `password` VARCHAR(255) NOT NULL COMMENT 'Hashed user password',
  `role` ENUM('shopper', 'admin') NOT NULL DEFAULT 'shopper' COMMENT 'User role (shopper or admin)',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'User account status',
  `telephone` VARCHAR(25) DEFAULT NULL COMMENT 'User phone number',
  `city` VARCHAR(100) DEFAULT NULL COMMENT 'User city',
  `motivation` TEXT DEFAULT NULL COMMENT 'Shopper motivation statement',
  `birth_year` YEAR DEFAULT NULL COMMENT 'User birth year',
  `gender` ENUM('male', 'female', 'other', 'prefer_not_say') DEFAULT 'prefer_not_say' COMMENT 'User gender identity',
  `cv_url` VARCHAR(512) DEFAULT NULL COMMENT 'URL to the user CV/Resume file',
  `profile_pic_url` VARCHAR(512) DEFAULT NULL COMMENT 'URL to the user profile picture',
  `registration_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date and time of registration',
  `completed_missions` INT DEFAULT 0 COMMENT 'Count of successfully completed missions'
) ENGINE=InnoDB COMMENT='Stores user accounts (shoppers, admins)';

--
-- Table structure for table `missions`
-- Stores details about each mystery shopping mission.
--
DROP TABLE IF EXISTS `missions`;
CREATE TABLE `missions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique mission identifier',
  `title` VARCHAR(255) NOT NULL COMMENT 'Title of the mission',
  `description` TEXT NOT NULL COMMENT 'Detailed description of the mission tasks',
  `deadline` DATETIME NOT NULL COMMENT 'Submission deadline for the mission report',
  `reward` DECIMAL(10, 2) NOT NULL COMMENT 'Reward amount for completing the mission',
  `location` VARCHAR(255) NOT NULL COMMENT 'Location of the mission (address or coordinates)',
  `category` VARCHAR(100) DEFAULT NULL COMMENT 'Category of the mission (e.g., Retail, Restaurant)',
  `business_name` VARCHAR(255) DEFAULT NULL COMMENT 'Name of the business being evaluated',
  `status` ENUM('available', 'assigned', 'submitted', 'approved', 'refused', 'cancelled') NOT NULL DEFAULT 'available' COMMENT 'Current status of the mission',
  `survey_questions` JSON DEFAULT NULL COMMENT 'JSON array defining the survey questions for this mission',
  `created_by` INT COMMENT 'ID of the admin user who created the mission',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of mission creation',
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL -- Set creator to NULL if admin deleted
) ENGINE=InnoDB COMMENT='Stores details about each mystery shopping mission';

--
-- Table structure for table `assignments`
-- Tracks which users are assigned to which missions (or have applied).
--
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique assignment identifier',
  `user_id` INT NOT NULL COMMENT 'ID of the user (shopper)',
  `mission_id` INT NOT NULL COMMENT 'ID of the mission',
  `status` ENUM('pending', 'assigned', 'completed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Status of the application/assignment',
  `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the user applied or was assigned',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE, -- Delete assignment if user is deleted
  FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON DELETE CASCADE, -- Delete assignment if mission is deleted
  UNIQUE KEY `user_mission_unique` (`user_id`, `mission_id`) -- Prevent duplicate assignments/applications
) ENGINE=InnoDB COMMENT='Links users to missions they are assigned to or applied for';

--
-- Table structure for table `reports`
-- Stores the submitted reports from shoppers for missions.
--
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique report identifier',
  `mission_id` INT NOT NULL COMMENT 'ID of the mission this report is for',
  `user_id` INT NOT NULL COMMENT 'ID of the user (shopper) who submitted the report',
  `answers` JSON NOT NULL COMMENT 'JSON object containing the answers to the survey questions',
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the report was submitted',
  `status` ENUM('submitted', 'approved', 'refused') NOT NULL DEFAULT 'submitted' COMMENT 'Status of the report review',
  `refusal_reason` TEXT DEFAULT NULL COMMENT 'Reason provided if the report was refused',
  FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON DELETE CASCADE, -- Delete report if mission is deleted
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE -- Delete report if user is deleted
) ENGINE=InnoDB COMMENT='Stores submitted mission reports from shoppers';

--
-- Table structure for table `notifications`
-- Stores notifications for users (e.g., new missions, report status changes).
--
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique notification identifier',
  `user_id` INT NOT NULL COMMENT 'ID of the user receiving the notification',
  `type` VARCHAR(50) NOT NULL COMMENT 'Type of notification (e.g., NEW_MISSION, REPORT_APPROVED, REPORT_REFUSED, DEADLINE_REMINDER)',
  `message` TEXT NOT NULL COMMENT 'The notification message content',
  `related_mission_id` INT DEFAULT NULL COMMENT 'Optional: ID of the mission related to the notification',
  `related_report_id` INT DEFAULT NULL COMMENT 'Optional: ID of the report related to the notification',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether the user has read the notification',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the notification was created',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`related_mission_id`) REFERENCES `missions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`related_report_id`) REFERENCES `reports`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Stores user notifications';

-- Restore character set settings
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
