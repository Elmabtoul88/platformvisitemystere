-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 19 juil. 2025 à 10:10
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `missionview_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('pending','approved','refused') NOT NULL,
  `refusal_reason` text DEFAULT NULL,
  `applied_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `applications`
--

INSERT INTO `applications` (`id`, `mission_id`, `user_id`, `status`, `refusal_reason`, `applied_at`) VALUES
(1, 2, 2, 'approved', NULL, '2025-05-13 14:00:27'),
(2, 3, 3, 'approved', NULL, '2025-05-12 14:00:27'),
(3, 5, 1, 'approved', NULL, '2025-05-14 02:00:27'),
(4, 8, 4, 'approved', NULL, '2025-05-14 09:00:27'),
(5, 1, 5, 'refused', 'Applicant does not meet experience criteria for online evaluations.', '2025-05-11 14:00:27'),
(6, 4, 6, 'approved', NULL, '2025-05-14 12:00:27'),
(9, 5, 7, 'approved', NULL, '2025-05-29 20:18:24'),
(10, 6, 7, 'approved', NULL, '2025-06-04 11:40:33'),
(11, 11, 7, 'approved', NULL, '2025-07-17 11:17:55');

-- --------------------------------------------------------

--
-- Structure de la table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `assignments`
--

INSERT INTO `assignments` (`id`, `mission_id`, `user_id`, `assigned_at`) VALUES
(1, 1, 1, '2025-05-14 13:13:41'),
(2, 1, 2, '2025-05-14 13:13:41'),
(3, 1, 3, '2025-05-14 13:13:41'),
(4, 1, 4, '2025-05-14 13:13:41'),
(5, 1, 5, '2025-05-14 13:13:41'),
(6, 4, 1, '2025-05-11 13:13:41'),
(7, 5, 1, '2025-05-14 13:13:41'),
(8, 6, 1, '2025-05-14 13:13:41'),
(9, 7, 6, '2025-05-08 13:13:41'),
(10, 8, 2, '2025-05-14 13:13:41'),
(11, 8, 3, '2025-05-06 13:13:41'),
(12, 8, 4, '2025-05-14 13:13:41'),
(13, 5, 7, '2025-06-02 17:34:25'),
(15, 8, 2, '2025-06-04 11:31:01'),
(16, 8, 3, '2025-06-04 11:31:01'),
(17, 8, 4, '2025-06-04 11:31:01'),
(18, 8, 5, '2025-06-04 11:31:01'),
(19, 8, 6, '2025-06-04 11:31:01'),
(20, 8, 7, '2025-06-04 11:31:01'),
(21, 6, 7, '2025-06-13 14:33:12'),
(22, 4, 6, '2025-06-13 14:33:16'),
(23, 3, 3, '2025-06-13 14:38:13'),
(24, 2, 2, '2025-06-13 14:38:15'),
(25, 8, 4, '2025-06-13 14:38:16'),
(26, 2, 2, '2025-06-19 11:05:50'),
(27, 2, 4, '2025-06-19 11:05:50'),
(28, 2, 3, '2025-06-19 11:05:50'),
(29, 2, 2, '2025-07-17 11:15:08'),
(30, 2, 2, '2025-07-17 11:15:08'),
(31, 2, 4, '2025-07-17 11:15:08'),
(32, 2, 3, '2025-07-17 11:15:08'),
(33, 2, 5, '2025-07-17 11:15:08'),
(34, 11, 7, '2025-07-17 11:20:54'),
(35, 11, 7, '2025-07-17 11:21:12');

-- --------------------------------------------------------

--
-- Structure de la table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message_text` text NOT NULL COMMENT 'The content of the message',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Timestamp when the message was sent',
  `is_read` tinyint(1) DEFAULT 0 COMMENT 'Whether the receiver has read the message'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `sender_id`, `receiver_id`, `message_text`, `created_at`, `is_read`) VALUES
(1, 1, 2, 'Hello Bob, your report is ready.', '2025-05-12 16:09:14', 0),
(2, 2, 1, 'Thanks Alice! When can I see it?', '2025-05-13 16:09:14', 0),
(3, 3, 1, 'Hi Alice, I need help with my task.', '2025-05-14 13:09:14', 0),
(4, 1, 3, 'Sure Carol, I’ll check on that.', '2025-05-14 14:09:14', 0),
(5, 2, 3, 'Hey Carol, are you joining the mission?', '2025-05-14 15:09:14', 0),
(6, 3, 2, 'Yes, I’ll confirm soon.', '2025-05-14 15:39:14', 0),
(7, 2, 7, 'ok', '0000-00-00 00:00:00', 0),
(8, 7, 2, 'ok', '0000-00-00 00:00:00', 0),
(9, 7, 2, 'hello bro ', '0000-00-00 00:00:00', 0),
(10, 2, 7, 'you doing great', '0000-00-00 00:00:00', 0),
(11, 7, 2, 'hi who are you i have ..', '0000-00-00 00:00:00', 0);

-- --------------------------------------------------------

--
-- Structure de la table `missions`
--

CREATE TABLE `missions` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `deadline` datetime DEFAULT NULL,
  `reward` decimal(10,2) DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `status` enum('available','assigned','submitted','approved','refused','pending_approval') NOT NULL,
  `assignedTo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`assignedTo`)),
  `businessName` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `missions`
--

INSERT INTO `missions` (`id`, `title`, `description`, `deadline`, `reward`, `latitude`, `longitude`, `category`, `status`, `assignedTo`, `businessName`, `location`) VALUES
(1, 'Dinner Service Evaluation at Gourmet Place', 'Evaluate the dinner service quality, food presentation, and overall ambiance. Order a main course and a drink. Submit report within 24 hours.', '2025-05-07 00:00:00', 60.00, 34.037879, -4.996095, 'Service', 'submitted', '[1, 2, 3, 4, 5,7]', 'Gourmet Place Inc.', 'casablaca ain sbaa'),
(2, 'Retail Store Cleanliness Check', 'Visit the downtown branch and assess store cleanliness, staff helpfulness, and product availability. Purchase a small item.', '2025-05-11 13:18:02', 35.00, 34.050000, -118.250000, 'Retail', 'available', '[1,7]', 'Fashion Forward Ltd.', 'casablanca'),
(3, 'Coffee Shop Speed of Service', 'Order a standard latte during peak morning hours (8-9 AM) and time the service from order to receiving the drink.', '2025-05-07 13:18:02', 20.00, 34.048000, -118.240000, 'Service', 'assigned', '[1]', 'Quick Coffee Co.', 'fes'),
(4, 'Completed: Hotel Check-in Experience', 'Assess the check-in process, staff friendliness, and lobby atmosphere.', '2025-05-04 13:18:02', 70.00, 34.060000, -118.260000, 'Service', 'assigned', '[1]', 'Grand Hotel Group', 'meknes'),
(5, 'Fast Food Drive-Thru Accuracy', 'Order a specific meal combo via drive-thru and verify order accuracy and speed.', '2025-05-10 13:18:02', 25.00, 34.058000, -118.235000, 'Restaurant', 'assigned', '[1]', 'Burger Bonanza', 'taza'),
(6, 'Grocery Store Checkout Efficiency', 'Evaluate the checkout speed and friendliness of the cashier during evening hours (5-7 PM). Purchase 5-10 items.', '2025-05-08 13:18:02', 30.00, 34.045000, -118.255000, 'Retail', 'assigned', '[]', 'SuperMart Foods', 'tanger'),
(7, 'Refused: Library Ambiance Check', 'Assess the noise level and general ambiance of the main reading room.', '2025-05-01 13:18:02', 15.00, 34.065000, -118.248000, 'Service', 'refused', '[7]', 'City Library System', 'tanger'),
(8, 'Electronics Store Demo Station', 'Interact with the new VR demo station and report on staff assistance and equipment functionality.', '2025-05-12 13:18:02', 45.00, 34.052000, -118.270000, 'Retail', 'assigned', '[2,3,4,1]', 'Tech World', 'tanger'),
(11, 'Coffe Shop Traditionnal Store', 'this mission should be very secret we have cover all sides as services and order delivery time as mystery client you should counting currents clients when you present into a store and also how many time a order took ', '2025-06-26 00:00:00', 20.00, 34.028408, -5.025878, 'Service', 'assigned', NULL, 'retail', '34.028408,-5.025877 fes');

-- --------------------------------------------------------

--
-- Structure de la table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `submitted_at` datetime NOT NULL,
  `status` enum('submitted','approved','refused') NOT NULL,
  `refusal_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `reports`
--

INSERT INTO `reports` (`id`, `mission_id`, `user_id`, `answers`, `submitted_at`, `status`, `refusal_reason`) VALUES
(1, 1, 1, '[\r\n { \"type\": \"rating\", \"value\": 5 },\r\n { \"type\": \"text\", \"value\": \"Clean store, friendly staff. Excellent service overall.\" },\r\n   { \"type\": \"image_upload\", \"value\": [\"https://picsum.photos/400/300?random=11\"] }\r\n]\r\n\r\n\r\n', '2025-05-05 14:51:23', 'refused', 'hello word ok no paiyement'),
(2, 1, 7, '[\r\n  { \"type\": \"rating\", \"value\": 2 },\r\n  { \"type\": \"text\", \"value\": \"Food was cold and service slow.\" },\r\n   { \"type\": \"image_upload\", \"value\": [\"https://picsum.photos/400/300?random=12\"] }\r\n]', '2025-05-04 14:51:23', 'approved', ''),
(3, 3, 1, '[\r\n   { \"type\": \"rating\", \"value\": 4 },\r\n   { \"type\": \"text\", \"value\": \"Well equipped gym with clean facilities.\" },\r\n   { \"type\": \"image_upload\", \"value\": [\"https://picsum.photos/400/300?random=13\"] }\r\n]', '2025-05-07 14:51:23', 'submitted', NULL),
(4, 4, 1, '[{ \"type\": \"rating\", \"value\": 4 },{ \"type\": \"text\", \"value\": \"Check-in was smooth, staff were polite. Lobby was clean but a bit dated.\" },{ \"type\": \"image_upload\", \"value\": [\"https://picsum.photos/400/300?random=1\"] }\r\n]', '2025-05-06 14:51:23', 'approved', NULL),
(5, 5, 1, '[\r\n   { \"type\": \"rating\", \"value\": 3 },\r\n  { \"type\": \"text\", \"value\": \"Projection was good, but seating was uncomfortable.\" },\r\n   { \"type\": \"image_upload\", \"value\": [\"https://picsum.photos/400/300?random=14\"] }\r\n]', '2025-05-07 13:51:23', 'submitted', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `survey_questions`
--

CREATE TABLE `survey_questions` (
  `id` int(11) NOT NULL COMMENT 'Unique question ID',
  `mission_id` int(11) NOT NULL COMMENT 'Associated mission ID',
  `type` enum('rating','multiple_choice','text','image_upload','checkboxes','gps_capture','audio_recording') NOT NULL COMMENT 'Type of the question',
  `text` text NOT NULL COMMENT 'The actual question text',
  `is_required` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Is the question mandatory?',
  `max_rating` int(11) DEFAULT NULL COMMENT 'Only for rating questions',
  `min_label` varchar(100) DEFAULT NULL COMMENT 'Only for rating questions',
  `max_label` varchar(100) DEFAULT NULL COMMENT 'Only for rating questions',
  `allow_multiple` tinyint(1) DEFAULT NULL COMMENT 'Only for image_upload or checkboxes',
  `max_images` int(11) DEFAULT NULL COMMENT 'Only for image_upload type',
  `max_duration_seconds` int(11) DEFAULT NULL COMMENT 'Only for audio_recording type',
  `options_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Store options as JSON array if needed (e.g., for multiple_choice, checkboxes)' CHECK (json_valid(`options_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `survey_questions`
--

INSERT INTO `survey_questions` (`id`, `mission_id`, `type`, `text`, `is_required`, `max_rating`, `min_label`, `max_label`, `allow_multiple`, `max_images`, `max_duration_seconds`, `options_json`) VALUES
(1, 1, 'rating', 'evaluler le service ', 1, 5, 'poor', 'excellent', NULL, NULL, NULL, NULL),
(2, 1, 'text', 'evaluer le diner ', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 1, 'image_upload', 'Upload a photo of your main course.', 0, NULL, NULL, NULL, 0, 1, NULL, NULL),
(4, 2, 'rating', 'Rate the overall cleanliness of the store.', 1, 5, 'Dirty', 'Spotless', NULL, NULL, NULL, NULL),
(5, 2, 'multiple_choice', 'How helpful were the staff members?', 1, NULL, NULL, NULL, NULL, NULL, NULL, '[{\"id\": 1, \"text\": \"Very Helpful\"}, {\"id\": 2, \"text\": \"Somewhat Helpful\"}, {\"id\": 3, \"text\": \"Not Helpful\"}, {\"id\": 4, \"text\": \"Did not interact\"}]'),
(6, 5, 'text', 'Provide any additional comments about your experience.', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 5, 'image_upload', 'Upload a photo of the storefront.', 1, NULL, NULL, NULL, 0, 1, NULL, NULL),
(8, 3, 'rating', 'Rate the check-in efficiency.', 1, 5, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 3, 'text', 'Comments on staff friendliness and lobby atmosphere.', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 3, 'image_upload', 'Upload a photo of the lobby.', 0, NULL, NULL, NULL, 0, 1, NULL, NULL),
(11, 6, 'rating', 'Rate the speed of the checkout process.', 1, 5, 'Very Slow', 'Very Fast', NULL, NULL, NULL, NULL),
(12, 6, 'rating', 'Rate the friendliness of the cashier.', 1, 5, 'Unfriendly', 'Very Friendly', NULL, NULL, NULL, NULL),
(13, 6, 'checkboxes', 'Which payment methods were clearly available?', 0, NULL, NULL, NULL, 1, NULL, NULL, '[{\"id\": 1, \"text\": \"Cash\"}, {\"id\": 2, \"text\": \"Credit/Debit Card\"}, {\"id\": 3, \"text\": \"Mobile Pay (Apple/Google Pay)\"}, {\"id\": 4, \"text\": \"Store App\"}]'),
(14, 6, 'gps_capture', 'Capture your location upon leaving the store.', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 6, 'audio_recording', 'Record a brief audio comment about the checkout noise level (optional).', 0, NULL, NULL, NULL, NULL, NULL, 30, NULL),
(16, 6, 'image_upload', 'Upload photos of your receipt and purchased items.', 1, NULL, NULL, NULL, 1, 3, NULL, NULL),
(17, 6, 'text', 'Any suggestions for improvement?', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 1, 'text', 'cc', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 1, 'multiple_choice', 'gender', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 1, 'checkboxes', 'validate', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 1, 'text', 'rr', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 1, 'text', 'gg', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 5, 'multiple_choice', 'choisissez entre ces choix', 0, NULL, NULL, NULL, NULL, NULL, NULL, '[{\"id\": 1, \"text\": \"Very Helpful\"}, {\"id\": 2, \"text\": \"Somewhat Helpful\"}, {\"id\": 3, \"text\": \"Not Helpful\"}, {\"id\": 4, \"text\": \"Did not interact\"}]'),
(24, 5, 'audio_recording', '', 0, NULL, NULL, NULL, NULL, NULL, 60, NULL),
(25, 5, 'gps_capture', '', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 5, 'rating', 'shoppers are fast', 1, 5, 'very low', 'very fast', NULL, NULL, NULL, NULL),
(27, 5, 'checkboxes', 'choissisez un choix', 1, NULL, NULL, NULL, NULL, NULL, NULL, '[{\"id\": 1, \"text\": \"Very Helpful\"}, {\"id\": 2, \"text\": \"Somewhat Helpful\"}, {\"id\": 3, \"text\": \"Not Helpful\"}, {\"id\": 4, \"text\": \"Did not interact\"}]'),
(28, 11, 'text', 'name of store', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 11, 'multiple_choice', 'food quality', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 11, 'rating', '', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 11, 'image_upload', '', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 11, 'audio_recording', '', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 11, 'gps_capture', '', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'User''s full name',
  `email` varchar(255) NOT NULL COMMENT 'User''s unique email address',
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `role` enum('shopper','admin') NOT NULL DEFAULT 'shopper' COMMENT 'User role',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'User account status',
  `registration_date` timestamp NULL DEFAULT current_timestamp() COMMENT 'Date and time of user registration',
  `profile_pic_url` varchar(255) DEFAULT NULL COMMENT 'URL to the user''s profile picture',
  `city` varchar(255) DEFAULT NULL COMMENT 'User''s city or general location',
  `telephone` varchar(25) DEFAULT NULL COMMENT 'User''s phone number',
  `motivation` text DEFAULT NULL COMMENT 'User''s motivation for being a shopper',
  `cv_url` varchar(255) DEFAULT NULL COMMENT 'URL to the user''s uploaded CV/Resume',
  `birth_year` int(11) DEFAULT NULL COMMENT 'User''s year of birth',
  `gender` enum('female','male','other','prefer_not_say') DEFAULT 'prefer_not_say' COMMENT 'User''s gender',
  `completed_missions_count` int(11) DEFAULT 0 COMMENT 'Counter for completed missions (optional denormalization)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `registration_date`, `profile_pic_url`, `city`, `telephone`, `motivation`, `cv_url`, `birth_year`, `gender`, `completed_missions_count`) VALUES
(1, 'Alice Johnson', 'alice.johnson@example.com', '$2b$10$1w6zI.1qhW4pc/fsTzTvCOVhSQyZajeg9AMxNhK.r1uY2hUUKb0pa', 'shopper', 'inactive', '2025-05-06 11:16:52', 'https://gravatar.com/avatar/78b225d16a56f009387c91cc6d66e4be?s=400&d=robohash&r=x', 'Los Angeles', '+1234567890', 'I love exploring new places and giving feedback to improve services.', 'https://example.com/cv/alice.pdf', 1990, 'female', 5),
(2, 'Bob Smith', 'bob.smith@example.com', '$2b$10$zcv0QXWNyeSH2hCo4RKgY.379vKbJjURTEa0FahMN5GOcO4mClZW2', 'admin', 'active', '2025-05-06 11:16:52', 'https://gravatar.com/avatar/29c6af8f4ed0a673a83162700a1d2296?s=400&d=robohash&r=x', 'Santa Monica', '+1234567891', 'Mystery shopping helps me stay engaged and observant.', 'https://example.com/cv/bob.pdf', 1985, 'male', 3),
(3, 'Carol Davis', 'carol.davis@example.com', 'hashed_password_3', 'shopper', 'active', '2025-05-06 11:16:52', 'https://gravatar.com/avatar/9c66789992879d53fc8c6e366eae3a8f?s=400&d=robohash&r=x', 'Pasadena', '+1234567892', 'It’s exciting to be part of a system that enhances customer service.', 'https://example.com/cv/carol.pdf', 1992, 'female', 2),
(4, 'David Thompson', 'david.thompson@example.com', 'hashed_password_4', 'shopper', 'active', '2025-05-06 11:16:52', 'https://gravatar.com/avatar/d297bd5b29b60931466a0cadf544ebdd?s=400&d=robohash&r=x', 'Glendale', '+1234567893', 'I enjoy evaluating real-world service experiences.', 'https://example.com/cv/david.pdf', 1988, 'male', 4),
(5, 'Eve Martinez', 'eve.martinez@example.com', 'hashed_password_5', 'shopper', 'active', '2025-05-06 11:16:52', 'https://gravatar.com/avatar/cf2ad37706afe48a36c2dbd7bf3508cf?s=400&d=robohash&r=x', 'Burbank', '+1234567894', 'Mystery shopping lets me contribute to quality control.', 'https://example.com/cv/eve.pdf', 1995, 'female', 1),
(6, 'Franklin Lee', 'franklin.lee@example.com', 'hashed_password_6', 'shopper', 'active', '2025-05-06 11:16:52', 'https://gravatar.com/avatar/67b42f10cff6d8933307d03b471b7662?s=400&d=robohash&r=x', 'Long Beach', '+1234567895', 'I find satisfaction in helping brands improve.', 'https://example.com/cv/franklin.pdf', 1987, 'male', 0),
(7, 'elmabtoul abdel fettah', 'elmabtoul@gmail.com', '$2b$10$zcv0QXWNyeSH2hCo4RKgY.379vKbJjURTEa0FahMN5GOcO4mClZW2', 'shopper', 'active', '2025-05-27 19:05:04', NULL, NULL, '0622364010', NULL, NULL, NULL, 'prefer_not_say', 0);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Index pour la table `missions`
--
ALTER TABLE `missions`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT pour la table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `missions`
--
ALTER TABLE `missions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `survey_questions`
--
ALTER TABLE `survey_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique question ID', AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`),
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD CONSTRAINT `survey_questions_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
