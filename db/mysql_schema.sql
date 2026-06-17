-- MySQL Script for MissionView Platform
-- Compatible with the current Mock Data structure

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE SCHEMA IF NOT EXISTS `missionview_db` DEFAULT CHARACTER SET utf8mb4 ;
USE `missionview_db` ;

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('shopper', 'admin', 'client') NOT NULL DEFAULT 'shopper',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `profile_pic_url` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `country` VARCHAR(100) NULL,
  `telephone` VARCHAR(20) NULL,
  `birth_year` INT NULL,
  `gender` VARCHAR(50) NULL,
  `motivation` TEXT NULL,
  `cv_url` TEXT NULL,
  `registration_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `banking_info` JSON NULL COMMENT 'Store RIB, Bank Name, SWIFT, etc.',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `missions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `missions` (
  `id` VARCHAR(50) NOT NULL,
  `client_id` VARCHAR(50) NULL,
  `title` VARCHAR(255) NOT NULL,
  `business_name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `deadline` DATETIME NOT NULL,
  `reward` DECIMAL(10,2) NOT NULL,
  `location` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `country` VARCHAR(100) NULL,
  `category` VARCHAR(100) NULL,
  `status` ENUM('available', 'assigned', 'submitted', 'approved', 'refused') NOT NULL DEFAULT 'available',
  `sought_profile` VARCHAR(255) NULL,
  `profile_quiz` JSON NULL COMMENT 'Configurable profile questions',
  `briefing_url` TEXT NULL,
  `scenario_url` TEXT NULL,
  `questionnaire_pdf_url` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_missions_users_idx` (`client_id` ASC) VISIBLE,
  CONSTRAINT `fk_missions_users`
    FOREIGN KEY (`client_id`)
    REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `stores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `stores` (
  `id` VARCHAR(50) NOT NULL,
  `mission_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `address` TEXT NOT NULL,
  `latitude` DECIMAL(10,8) NULL,
  `longitude` DECIMAL(11,8) NULL,
  `active` TINYINT NOT NULL DEFAULT 1,
  `category` VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_stores_missions1_idx` (`mission_id` ASC) VISIBLE,
  CONSTRAINT `fk_stores_missions1`
    FOREIGN KEY (`mission_id`)
    REFERENCES `missions` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `applications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `applications` (
  `id` VARCHAR(50) NOT NULL,
  `mission_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `status` ENUM('pending', 'approved', 'refused') NOT NULL DEFAULT 'pending',
  `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `selected_store_ids` JSON NULL COMMENT 'Array of requested store IDs',
  `quiz_answers` JSON NULL,
  `refusal_reason` TEXT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_applications_missions1_idx` (`mission_id` ASC) VISIBLE,
  INDEX `fk_applications_users1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_applications_missions1`
    FOREIGN KEY (`mission_id`)
    REFERENCES `missions` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_applications_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `assignments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` VARCHAR(50) NOT NULL,
  `mission_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `store_id` VARCHAR(50) NULL,
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `planned_date` DATETIME NOT NULL,
  `time_window_minutes` INT NOT NULL DEFAULT 60,
  `status` ENUM('assigned', 'completed', 'expired') NOT NULL DEFAULT 'assigned',
  PRIMARY KEY (`id`),
  INDEX `fk_assignments_missions1_idx` (`mission_id` ASC) VISIBLE,
  INDEX `fk_assignments_users1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_assignments_stores1_idx` (`store_id` ASC) VISIBLE,
  CONSTRAINT `fk_assignments_missions1`
    FOREIGN KEY (`mission_id`)
    REFERENCES `missions` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_assignments_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_assignments_stores1`
    FOREIGN KEY (`store_id`)
    REFERENCES `stores` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `reports`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports` (
  `id` VARCHAR(50) NOT NULL,
  `mission_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `answers` JSON NOT NULL COMMENT 'Survey answers including links to media',
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('submitted', 'approved', 'refused') NOT NULL DEFAULT 'submitted',
  `refusal_reason` TEXT NULL,
  `payment_status` ENUM('pending', 'paid', 'refused') NULL DEFAULT 'pending',
  `payment_date` DATETIME NULL,
  `reward_amount` DECIMAL(10,2) NOT NULL,
  `transaction_ref` VARCHAR(100) NULL,
  `admin_notes` TEXT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_reports_missions1_idx` (`mission_id` ASC) VISIBLE,
  INDEX `fk_reports_users1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_reports_missions1`
    FOREIGN KEY (`mission_id`)
    REFERENCES `missions` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reports_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
