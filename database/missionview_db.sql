-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 21 oct. 2026 à 13:44
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
  `applied_at` datetime NOT NULL DEFAULT current_timestamp(),
  `stores` longtext NOT NULL,
  `quiz` longtext NOT NULL,
  `time_slot` enum('30','60','120','open') DEFAULT NULL,
  `mission_date` datetime DEFAULT NULL,
  `recognition_passed` tinyint(1) DEFAULT 0 COMMENT '0: non passé, 1: passé avec succès',
  `recognition_passed_at` timestamp NULL DEFAULT NULL COMMENT 'Date de réussite du quiz de reconnaissance',
  `last_quiz_attempt_at` timestamp NULL DEFAULT NULL COMMENT 'Date de la dernière tentative (réussie ou échouée)',
  `quiz_blocked_until` timestamp NULL DEFAULT NULL COMMENT 'Date jusqu''à laquelle le quiz est bloqué'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `applications`
--

INSERT INTO `applications` (`id`, `mission_id`, `user_id`, `status`, `refusal_reason`, `applied_at`, `stores`, `quiz`, `time_slot`, `mission_date`, `recognition_passed`, `recognition_passed_at`, `last_quiz_attempt_at`, `quiz_blocked_until`) VALUES
(81, 2, 1, 'approved', NULL, '2026-06-21 21:57:41', '[5,6,3]', '[{\"question_id\":1,\"question_text\":\"Date de la visite\",\"type\":\"text\",\"response\":\"cnccn\"},{\"question_id\":2,\"question_text\":\"Heure d\'arrivée\",\"type\":\"text\",\"response\":\"cncncn\"},{\"question_id\":3,\"question_text\":\"Ville\",\"type\":\"text\",\"response\":\"hhh\"},{\"question_id\":4,\"question_text\":\"Nom / code du magasin\",\"type\":\"text\",\"response\":\"hhhh\"},{\"question_id\":5,\"question_text\":\"Profil cliente mystère\",\"type\":\"checkboxes\",\"response\":[\"Nouvelle cliente (recrutement)\",\"Nouvelle cliente (recrutement)\"]},{\"question_id\":6,\"question_text\":\"Scénario testé\",\"type\":\"checkboxes\",\"response\":[\"Lift Pro Collagène\"]},{\"question_id\":8,\"question_text\":\"Le magasin est-il visible au loin ?\",\"type\":\"multiple_choice\",\"response\":\"OUI\"},{\"question_id\":9,\"question_text\":\"Les abords du magasin sont-ils propres ?\",\"type\":\"multiple_choice\",\"response\":\"NON\"},{\"question_id\":10,\"question_text\":\"La devanture était-elle propre ?\",\"type\":\"multiple_choice\",\"response\":\"OUI\"},{\"question_id\":11,\"question_text\":\"Le sol devant le magasin était-il propre ?\",\"type\":\"multiple_choice\",\"response\":\"OUI\"},{\"question_id\":12,\"question_text\":\"La façade était-elle en bon état ?\",\"type\":\"multiple_choice\",\"response\":\"NON\"},{\"question_id\":13,\"question_text\":\"Le logo était-il visible et éclairé ?\",\"type\":\"multiple_choice\",\"response\":\"OUI\"}]', '120', '2026-07-20 12:00:00', 0, NULL, NULL, NULL),
(85, 60, 1, 'approved', NULL, '2026-07-01 14:03:20', '[27,29]', '[{\"question_id\":1,\"question_text\":\"Date de la visite\",\"type\":\"text\",\"response\":\"14h30\"},{\"question_id\":2,\"question_text\":\"Heure d\'arrivée\",\"type\":\"text\",\"response\":\"14h40\"},{\"question_id\":3,\"question_text\":\"Ville\",\"type\":\"text\",\"response\":\"rabaat\"},{\"question_id\":4,\"question_text\":\"Nom / code du magasin\",\"type\":\"text\",\"response\":\"store yvroche\"},{\"question_id\":5,\"question_text\":\"Profil cliente mystère\",\"type\":\"checkboxes\",\"response\":[\"Nouvelle cliente (recrutement)\"]},{\"question_id\":6,\"question_text\":\"Scénario testé\",\"type\":\"checkboxes\",\"response\":[\"Lift Pro Collagène\"]},{\"question_id\":8,\"question_text\":\"Le magasin est-il visible au loin ?\",\"type\":\"multiple_choice\",\"response\":\"OUI\"},{\"question_id\":9,\"question_text\":\"Les abords du magasin sont-ils propres ?\",\"type\":\"multiple_choice\",\"response\":\"NON\"},{\"question_id\":10,\"question_text\":\"La devanture était-elle propre ?\",\"type\":\"multiple_choice\",\"response\":\"OUI\"},{\"question_id\":11,\"question_text\":\"Le sol devant le magasin était-il propre ?\",\"type\":\"multiple_choice\",\"response\":\"NON\"},{\"question_id\":12,\"question_text\":\"La façade était-elle en bon état ?\",\"type\":\"multiple_choice\",\"response\":\"OUI\"},{\"question_id\":13,\"question_text\":\"Le logo était-il visible et éclairé ?\",\"type\":\"multiple_choice\",\"response\":\"OUI\"}]', '60', '2026-07-20 13:00:00', 1, '2026-07-20 10:56:53', '2026-07-20 10:56:53', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT current_timestamp(),
  `scenario` longtext DEFAULT NULL,
  `store_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `assignments`
--

INSERT INTO `assignments` (`id`, `mission_id`, `user_id`, `assigned_at`, `scenario`, `store_id`) VALUES
(113, 60, 1, '2026-05-12 12:17:45', 'test ..', 28),
(114, 60, 3, '2026-05-12 12:37:30', 'test yvkroches', 29),
(115, 60, 4, '2026-05-12 13:17:42', 'test', 33),
(116, 2, 1, '2026-06-15 16:46:51', 'testeet etst', 6);

-- --------------------------------------------------------

--
-- Structure de la table `bank_info`
--

CREATE TABLE `bank_info` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `account_holder` varchar(255) NOT NULL COMMENT 'Nom du titulaire',
  `rib` varchar(50) NOT NULL COMMENT 'RIB/IBAN',
  `bank_name` varchar(255) NOT NULL COMMENT 'Nom de la banque',
  `swift` varchar(50) DEFAULT NULL COMMENT 'Code SWIFT/BIC',
  `country` varchar(100) NOT NULL DEFAULT 'Maroc' COMMENT 'Pays',
  `currency` varchar(10) NOT NULL DEFAULT 'MAD' COMMENT 'Devise'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `bank_info`
--

INSERT INTO `bank_info` (`id`, `user_id`, `account_holder`, `rib`, `bank_name`, `swift`, `country`, `currency`) VALUES
(1, 1, 'hamou hassni', '2700054559665325007', 'Bank populaire', 'IHASOQUE', 'Maroc', 'EUR');

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
(1, 1, 2, 'Hello Bob, your report is ready.', '2025-05-12 16:09:14', 1),
(2, 2, 1, 'Thanks Alice! When can I see it?', '2025-05-13 16:09:14', 0),
(3, 3, 1, 'Hi Alice, I need help with my task.', '2025-05-14 13:09:14', 0),
(4, 1, 3, 'Sure Carol, I’ll check on that.', '2025-05-14 14:09:14', 0),
(5, 2, 3, 'Hey Carol, are you joining the mission?', '2025-05-14 15:09:14', 0),
(6, 3, 2, 'Yes, I’ll confirm soon.', '2025-05-14 15:39:14', 1),
(7, 2, 7, 'ok', '0000-00-00 00:00:00', 0),
(8, 7, 2, 'ok', '0000-00-00 00:00:00', 1),
(9, 7, 2, 'hello bro ', '0000-00-00 00:00:00', 1),
(10, 2, 7, 'you doing great', '0000-00-00 00:00:00', 0),
(11, 7, 2, 'hi who are you i have ..', '0000-00-00 00:00:00', 1),
(12, 7, 2, 'hi', '2025-07-25 22:05:32', 1),
(13, 2, 7, 'hi', '2025-07-25 23:00:59', 0),
(14, 2, 7, 'hi', '2025-07-25 23:12:46', 0),
(15, 2, 7, 'hi', '2025-07-25 23:24:08', 0),
(17, 9, 2, 'hey', '2025-07-26 11:38:21', 1),
(18, 2, 9, 'hey', '2025-07-26 11:38:55', 0),
(24, 12, 2, 'bonsoir', '2025-09-10 18:23:15', 1),
(25, 12, 2, 'hey', '2025-09-10 18:41:29', 1),
(26, 12, 2, 'hi', '2025-09-10 18:57:46', 1),
(27, 12, 2, 'hello', '2025-09-10 19:05:47', 1),
(50, 2, 9, 'bonjour', '2025-09-13 12:53:49', 0),
(54, 12, 2, 'quoi de neuf', '2025-09-18 11:57:00', 1),
(55, 12, 2, 'vv', '2025-11-24 10:30:33', 1),
(56, 2, 1, 'hello', '2026-01-25 18:16:27', 0),
(57, 2, 1, 'i  want just asking you about planning of today blz??', '2026-01-27 12:41:42', 0),
(58, 1, 2, 'yes of course', '2026-01-27 12:42:11', 1),
(59, 1, 2, 'gg', '2026-01-31 13:25:49', 1),
(60, 1, 2, 'cc', '2026-01-31 13:27:34', 1),
(61, 1, 2, 'hi', '2026-01-31 13:28:21', 1),
(62, 1, 2, 'hello admin i have some problemes about my missions', '2026-06-15 15:59:03', 1),
(63, 1, 2, 'hello', '2026-06-27 13:27:57', 0);

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
  `category` varchar(100) DEFAULT NULL,
  `status` enum('available','completed','cancelled') NOT NULL,
  `assignedTo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `businessName` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `clientId` int(11) DEFAULT NULL,
  `pays` varchar(255) DEFAULT NULL,
  `ville` varchar(255) DEFAULT NULL,
  `briefing` varchar(255) DEFAULT NULL,
  `scenario` varchar(255) DEFAULT NULL,
  `questionnaire` varchar(255) DEFAULT NULL,
  `profil` varchar(255) DEFAULT NULL
) ;

--
-- Déchargement des données de la table `missions`
--

INSERT INTO `missions` (`id`, `title`, `description`, `deadline`, `reward`, `category`, `status`, `assignedTo`, `businessName`, `location`, `clientId`, `pays`, `ville`, `briefing`, `scenario`, `questionnaire`, `profil`) VALUES
(2, 'Retail Store Cleanliness Check', 'Visit the downtown branch and assess store cleanliness, staff helpfulness, and product availability. Purchase a small item.', '2026-03-19 00:00:00', 35.00, 'Retail', 'available', '[1,7]', 'Fashion Forward Ltd.', 'casablanca', 0, NULL, NULL, NULL, NULL, NULL, NULL),
(60, 'YVES ROCHER (MAROC)', 'Projet de visite mystère réalisé chez Yves Rocher Maroc\r\n afin d’évaluer la qualité du service client, l’accueil, les conseils beauté, la présentation du magasin et le respect des standards de la marque dans le cadre de l’amélioration de l’expérience client.', '2026-07-01 00:00:00', 20.00, 'Retail', 'available', NULL, 'Produits de beauté', 'rabat', 7, 'maroc', 'casablanca', 'http://localhost:5000/uploads/test.pdf', 'http://localhost:5000/uploads/test.pdf', 'http://localhost:5000/uploads/test.pdf', 'femme de 30-45 peau bronzée'),
(74, 'aaaa', 'aaaa dddd', '2026-08-06 00:00:00', 200.00, 'Beauté', 'available', NULL, 'aaaaa', 'aaaaa, aaaa', NULL, 'aaaa', 'aaaaa', 'http://localhost:5000/documents/aaaa_briefing_2026-07-01T15-07-15-623Z.pdf', 'http://localhost:5000/documents/aaaa_scenario_2026-07-01T15-07-15-633Z.pdf', 'http://localhost:5000/documents/aaaa_questionnaire_2026-07-01T15-07-15-635Z.pdf', 'aaaaa');

-- --------------------------------------------------------

--
-- Structure de la table `mission_recognition_quizzes`
--

CREATE TABLE `mission_recognition_quizzes` (
  `id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `type` enum('multiple_choice','checkboxes') NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `correct_answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`correct_answers`)),
  `points` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `mission_recognition_quizzes`
--

INSERT INTO `mission_recognition_quizzes` (`id`, `mission_id`, `question`, `type`, `options`, `correct_answers`, `points`, `created_at`) VALUES
(1, 60, 'ddddd', 'multiple_choice', '[{\"text\":\"aaa\"},{\"text\":\"zzz\"}]', '[\"aaa\"]', 1, '2026-07-01 15:07:15'),
(2, 60, 'rrr', 'checkboxes', '[{\"text\":\"wwww\"},{\"text\":\"xxxxx\"}]', '[\"xxxxx\"]', 1, '2026-07-01 15:07:15');

-- --------------------------------------------------------

--
-- Structure de la table `mission_recognition_results`
--

CREATE TABLE `mission_recognition_results` (
  `id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL COMMENT 'Score en pourcentage (100 ou 50)',
  `total_questions` int(11) NOT NULL,
  `correct_answers` int(11) NOT NULL,
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `mission_recognition_results`
--

INSERT INTO `mission_recognition_results` (`id`, `mission_id`, `user_id`, `score`, `total_questions`, `correct_answers`, `completed_at`) VALUES
(20, 60, 1, 100.00, 2, 2, '2026-07-20 11:56:53');

-- --------------------------------------------------------

--
-- Structure de la table `mission_recognition_settings`
--

CREATE TABLE `mission_recognition_settings` (
  `id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `passing_score` int(11) DEFAULT 100 COMMENT 'Score minimum en pourcentage (100 ou 50)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `message`, `created_at`) VALUES
(1, 1, 'report', 'Votre rapport pour la mission #1 a été soumis avec succès.', '2026-01-28 13:25:18'),
(2, 1, 'report', 'Votre rapport pour la mission #2 a été soumis avec succès.', '2026-01-28 13:38:02'),
(3, 1, 'report', 'Votre rapport pour la mission #55 a été soumis avec succès.', '2026-01-29 16:00:29'),
(4, 1, 'report', 'Votre rapport pour la mission #55 a été soumis avec succès.', '2026-01-29 16:24:19'),
(5, 1, 'report', 'Votre rapport pour la mission #55 a été soumis avec succès.', '2026-01-29 16:25:34'),
(6, 1, 'report', 'Votre rapport pour la mission #55 a été soumis avec succès.', '2026-01-29 16:34:19'),
(7, 1, 'report', 'Votre rapport pour la mission #56 a été soumis avec succès.', '2026-01-30 13:40:17'),
(8, 12, 'report', 'Votre rapport pour la mission #56 a été soumis avec succès.', '2026-01-31 12:50:49'),
(9, 1, 'report', 'Votre rapport pour la mission #57 a été soumis avec succès.', '2026-02-04 16:25:07'),
(10, 1, 'report', 'Votre rapport pour la mission #56 a été soumis avec succès.', '2026-02-20 20:20:05'),
(11, 1, 'report', 'Votre rapport pour la mission #56 a été soumis avec succès.', '2026-02-20 20:35:49'),
(12, 1, 'report', 'Votre rapport pour la mission #56 a été soumis avec succès.', '2026-02-20 20:39:16'),
(13, 1, 'report', 'Votre rapport pour la mission #56 a été soumis avec succès.', '2026-02-20 21:15:55'),
(14, 1, 'report', 'Votre rapport pour la mission #59 a été soumis avec succès.', '2026-02-20 22:19:02'),
(15, 1, 'report', 'Votre rapport pour la mission #60 a été soumis avec succès.', '2026-05-12 12:30:03'),
(16, 3, 'report', 'Votre rapport pour la mission #60 a été soumis avec succès.', '2026-05-12 12:39:53'),
(17, 4, 'report', 'Votre rapport pour la mission #60 a été soumis avec succès.', '2026-05-12 13:20:10'),
(18, 1, 'report', 'Votre rapport pour la mission #61 a été soumis avec succès.', '2026-06-15 16:56:26');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL COMMENT 'Unique question ID',
  `mission_id` int(11) NOT NULL COMMENT 'Associated mission ID',
  `type` enum('rating','multiple_choice','text','image_upload','checkboxes','gps_capture','audio_recording','section_header','info_text') NOT NULL COMMENT 'Type of the question',
  `text` text NOT NULL COMMENT 'The actual question text',
  `is_required` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Is the question mandatory?',
  `max_rating` int(11) DEFAULT NULL COMMENT 'Only for rating questions',
  `min_label` varchar(100) DEFAULT NULL COMMENT 'Only for rating questions',
  `max_label` varchar(100) DEFAULT NULL COMMENT 'Only for rating questions',
  `allow_multiple` tinyint(1) DEFAULT NULL COMMENT 'Only for image_upload or checkboxes',
  `max_images` int(11) DEFAULT NULL COMMENT 'Only for image_upload type',
  `max_duration_seconds` int(11) DEFAULT NULL COMMENT 'Only for audio_recording type',
  `options_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Store options as JSON array if needed (e.g., for multiple_choice, checkboxes)',
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `mission_id`, `type`, `text`, `is_required`, `max_rating`, `min_label`, `max_label`, `allow_multiple`, `max_images`, `max_duration_seconds`, `options_json`, `user_id`) VALUES
(1, 60, 'text', 'Date de la visite', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
(2, 60, 'text', 'Heure d\'arrivée', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
(3, 60, 'text', 'Ville', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
(4, 60, 'text', 'Nom / code du magasin', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
(5, 60, 'checkboxes', 'Profil cliente mystère', 0, NULL, NULL, NULL, 1, NULL, NULL, '[{\"id\":1778579238050,\"text\":\"Nouvelle cliente (recrutement)\"},{\"id\":1778579255539,\"text\":\"Cliente existante\"}]', 1),
(6, 60, 'checkboxes', 'Scénario testé', 0, NULL, NULL, NULL, 1, NULL, NULL, '[{\"id\":1778579285514,\"text\":\"Glow Énergie\"},{\"id\":1778579321215,\"text\":\"Lift Pro Collagène\"},{\"id\":1778579329523,\"text\":\"Anti-Âge\"},{\"id\":1778579370635,\"text\":\"Mixte (plusieurs gammes)\"}]', 1),
(7, 60, 'section_header', '2.OBSERVATION EXTÉRIEURE DU MAGASIN (OUI / NON)', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1),
(8, 60, 'multiple_choice', 'Le magasin est-il visible au loin ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579418050,\"text\":\"OUI\"},{\"id\":1778579425015,\"text\":\"NON\"}]', 1),
(9, 60, 'multiple_choice', 'Les abords du magasin sont-ils propres ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579431624,\"text\":\"OUI\"},{\"id\":1778579453286,\"text\":\"NON\"}]', 1),
(10, 60, 'multiple_choice', 'La devanture était-elle propre ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579535086,\"text\":\"OUI\"},{\"id\":1778579540889,\"text\":\"NON\"}]', 1),
(11, 60, 'multiple_choice', 'Le sol devant le magasin était-il propre ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579557144,\"text\":\"OUI\"},{\"id\":1778579562919,\"text\":\"NON\"}]', 1),
(12, 60, 'multiple_choice', 'La façade était-elle en bon état ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579567530,\"text\":\"OUI\"},{\"id\":1778579581251,\"text\":\"NON\"}]', 1),
(13, 60, 'multiple_choice', 'Le logo était-il visible et éclairé ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579594156,\"text\":\"OUI\"},{\"id\":1778579600098,\"text\":\"NON\"}]', 1),
(31, 74, 'text', 'dcdddd', 1, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(32, 74, 'multiple_choice', '', 1, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1782918384524,\"text\":\"hh\"},{\"id\":1782918384525,\"text\":\"uu\"}]', NULL),
(33, 74, 'checkboxes', 'eeee', 1, NULL, NULL, NULL, 1, NULL, NULL, '[{\"id\":1782918392955,\"text\":\"eee\"},{\"id\":1782918392956,\"text\":\"rrr\"}]', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `submitted_at` datetime NOT NULL,
  `status` enum('submitted','approved','refused','paid') NOT NULL,
  `refusal_reason` text DEFAULT NULL,
  `nomMagazin` varchar(255) DEFAULT NULL,
  `specificStoreAddress` varchar(255) DEFAULT NULL,
  `scenario` longtext DEFAULT NULL,
  `dateTimeMission` datetime DEFAULT NULL,
  `ville` varchar(200) NOT NULL,
  `store_id` int(11) NOT NULL,
  `reference_paiement` varchar(255) DEFAULT NULL
) ;

--
-- Déchargement des données de la table `reports`
--

INSERT INTO `reports` (`id`, `mission_id`, `user_id`, `answers`, `submitted_at`, `status`, `refusal_reason`, `nomMagazin`, `specificStoreAddress`, `scenario`, `dateTimeMission`, `ville`, `store_id`, `reference_paiement`) VALUES
(89, 60, 1, '[{\"section_id\":242,\"section_header\":\"1.INFORMATIONS SUR LE MAGAZIN\",\"responses\":[{\"question_id\":243,\"question\":\"Date de la visite\",\"type\":\"text\",\"value\":\"13/05/2026\"},{\"question_id\":244,\"question\":\"Heure d’arrivée\",\"type\":\"text\",\"value\":\"14h\"},{\"question_id\":245,\"question\":\"Ville\",\"type\":\"text\",\"value\":\"CASABLANCA\"},{\"question_id\":246,\"question\":\"Nom / code du magasin\",\"type\":\"text\",\"value\":\"Casa 2 mars\"},{\"question_id\":247,\"question\":\"Profil cliente mystère\",\"type\":\"checkboxes\",\"value\":{\"Nouvelle cliente (recrutement)\":true}},{\"question_id\":248,\"question\":\"Scénario testé\",\"type\":\"checkboxes\",\"value\":{\"Lift Pro Collagène\":true}}]},{\"section_id\":249,\"section_header\":\"2.OBSERVATION EXTÉRIEURE DU MAGASIN (OUI / NON)\",\"responses\":[{\"question_id\":250,\"question\":\"Le magasin est-il visible au loin ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":251,\"question\":\"Les abords du magasin sont-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":252,\"question\":\"La devanture était-elle propre ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":253,\"question\":\"Le sol devant le magasin était-il propre ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":254,\"question\":\"La façade était-elle en bon état ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":255,\"question\":\"Le logo était-il visible et éclairé ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":256,\"question\":\"Les vitrines étaient-elles propres ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":257,\"question\":\"Les vitrines donnaient-elles envie d’entrer ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":258,\"question\":\"Les offres / nouveautés étaient-elles visibles en vitrine ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":259,\"section_header\":\"3. AMBIANCE &amp; PROPRETÉ INTÉRIEURE (OUI / NON)\",\"responses\":[{\"question_id\":260,\"question\":\"L’odeur à l’entrée était-elle agréable ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":261,\"question\":\"L’odeur correspondait-elle à l’univers Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":262,\"question\":\"La musique était-elle présente ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":263,\"question\":\"Le volume de la musique était-il adapté ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":264,\"question\":\"L’éclairage était-il suffisant et chaleureux ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":265,\"question\":\"Les sols étaient-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":266,\"question\":\"Les meubles et présentoirs étaient-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":267,\"question\":\"Les testeurs étaient-ils propres et utilisables ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":268,\"section_header\":\"4. ORGANISATION DES RAYONS (OUI / NON)\",\"responses\":[{\"question_id\":269,\"question\":\"Les rayons étaient-ils bien rangés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":270,\"question\":\"Les produits étaient-ils faciles à identifier ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":271,\"question\":\"Les prix étaient-ils clairement affichés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":272,\"question\":\"Les promotions étaient-elles clairement signalées ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":273,\"question\":\"Les produits des gammes testées étaient disponibles ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":274,\"section_header\":\"5. APPARENCE &amp; TENUE DE LA CONSEILLÈRE (OUI / NON)\",\"responses\":[{\"question_id\":275,\"question\":\"La conseillère portait-elle l’uniforme Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":276,\"question\":\"L’uniforme était-il propre et soigné ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":277,\"question\":\"Les cheveux étaient-ils propres et bien coiffés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":278,\"question\":\"Les ongles étaient-ils propres et soignés ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":279,\"question\":\"L’apparence globale était-elle professionnelle ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":280,\"section_header\":\"6. ACCUEIL &amp; POSTURE COMMERCIALE (OUI / NON)\",\"responses\":[{\"question_id\":281,\"question\":\"J’ai été saluée à l’entrée ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":282,\"question\":\"La prise de contact a-t-elle été rapide ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":283,\"question\":\"La conseillère a-t-elle souri chaleureusement ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":284,\"question\":\"La conseillère a-t-elle été aimable ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":285,\"question\":\"L’attitude était-elle naturelle et professionnelle ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":286,\"section_header\":\"7. DÉCOUVERTE DES BESOINS CLIENTE (OUI / NON)\",\"responses\":[{\"question_id\":287,\"question\":\"La conseillère me demande mon type de peau ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":288,\"question\":\"A-t-elle demandé l’âge ou les préoccupations principales ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":289,\"question\":\"A-t-elle posé des questions sur la routine actuelle ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":290,\"question\":\"La conseillère me pose des questions concernant mes besoins ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":291,\"question\":\"A-t-elle personnalisé son conseil ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":292,\"section_header\":\"8. QUALITÉ DU CONSEIL PRODUIT (OUI / NON)\",\"responses\":[{\"question_id\":293,\"question\":\"La conseillère a-t-elle expliqué les bénéfices des produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":294,\"question\":\"A-t-elle expliqué comment utiliser les produits ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":295,\"question\":\"A-t-elle comparé plusieurs produits ou gammes ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":296,\"question\":\"A-t-elle proposé une routine complète ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":297,\"question\":\"A-t-elle utilisé ou proposé des testeurs ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":298,\"section_header\":\"9. RECRUTEMENT FIDÉLITÉ (SI NOUVELLE CLIENTE)\",\"responses\":[{\"question_id\":299,\"question\":\"La conseillère a-t-elle demandé si vous étiez cliente Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":300,\"question\":\"A-t-elle proposé le programme de fidélité ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":301,\"question\":\"A-t-elle expliqué clairement les avantages ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":302,\"question\":\"A-t-elle proposé une inscription immédiate ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":303,\"section_header\":\"10. CONVICTION &amp; INTENTION D’ACHAT (RESSENTI CLIENTE)\",\"responses\":[{\"question_id\":304,\"question\":\"Vous êtes-vous sentie écoutée ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":305,\"question\":\"Le conseil vous a-t-il semblé crédible et rassurant ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":306,\"question\":\"La conseillère vous a-t-elle donné confiance dans le produit ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":307,\"question\":\"En plus du produit conseillé, avez-vous acheté d’autres produits ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":308,\"question\":\"Le rapport qualité/prix vous a-t-il convaincue ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":309,\"question\":\"Le passage en caisse a été fluide ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":310,\"section_header\":\"11. RECOMMANDATION &amp; IMAGE DE MARQUE\",\"responses\":[{\"question_id\":311,\"question\":\"Recommanderiez-vous ce magasin Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":312,\"question\":\"Recommanderiez-vous l’enseigne Yves Rocher après cette visite ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":313,\"question\":\"Cette visite a-t-elle renforcé votre image positive de la marque ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":314,\"section_header\":\"12. SATISFACTION GLOBALE\",\"responses\":[{\"question_id\":315,\"question\":\"Êtes-vous satisfaite de votre expérience globale ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":316,\"question\":\"Avez-vous envie de revenir dans ce magasin ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":317,\"section_header\":\"13. COMMENTAIRES OBLIGATOIRES DU VISITEUR MYSTÈRE\",\"responses\":[{\"question_id\":318,\"question\":\"Point le plus positif observé\",\"type\":\"text\",\"value\":\"pas de commentaire\"},{\"question_id\":319,\"question\":\"Point le plus négatif observé\",\"type\":\"text\",\"value\":\"pas de commentaire\"}]}]', '2026-05-12 12:30:03', 'paid', 'hle pyment va ete apparaitre ', 'Casa 2 mars', '50 RESIDENCE BAYROUTE AVENUE 2 MARS', NULL, NULL, 'CASABLANCA', 28, 'REF655877'),
(93, 60, 1, '[{\"section_id\":242,\"section_header\":\"1.INFORMATIONS SUR LE MAGAZIN\",\"responses\":[{\"question_id\":243,\"question\":\"Date de la visite\",\"type\":\"text\",\"value\":\"27/05/2026\"},{\"question_id\":244,\"question\":\"Heure d’arrivée\",\"type\":\"text\",\"value\":\"18h\"},{\"question_id\":245,\"question\":\"Ville\",\"type\":\"text\",\"value\":\"RABAT\"},{\"question_id\":246,\"question\":\"Nom / code du magasin\",\"type\":\"text\",\"value\":\"Rabat 6\"},{\"question_id\":247,\"question\":\"Profil cliente mystère\",\"type\":\"checkboxes\",\"value\":{\"Cliente existante\":true}},{\"question_id\":248,\"question\":\"Scénario testé\",\"type\":\"checkboxes\",\"value\":{\"Mixte (plusieurs gammes)\":true}}]},{\"section_id\":249,\"section_header\":\"2.OBSERVATION EXTÉRIEURE DU MAGASIN (OUI / NON)\",\"responses\":[{\"question_id\":250,\"question\":\"Le magasin est-il visible au loin ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":false,\"NON\":true}},{\"question_id\":251,\"question\":\"Les abords du magasin sont-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":252,\"question\":\"La devanture était-elle propre ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":253,\"question\":\"Le sol devant le magasin était-il propre ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":254,\"question\":\"La façade était-elle en bon état ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":255,\"question\":\"Le logo était-il visible et éclairé ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":256,\"question\":\"Les vitrines étaient-elles propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":257,\"question\":\"Les vitrines donnaient-elles envie d’entrer ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":258,\"question\":\"Les offres / nouveautés étaient-elles visibles en vitrine ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":259,\"section_header\":\"3. AMBIANCE &amp; PROPRETÉ INTÉRIEURE (OUI / NON)\",\"responses\":[{\"question_id\":260,\"question\":\"L’odeur à l’entrée était-elle agréable ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":261,\"question\":\"L’odeur correspondait-elle à l’univers Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":262,\"question\":\"La musique était-elle présente ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":263,\"question\":\"Le volume de la musique était-il adapté ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":264,\"question\":\"L’éclairage était-il suffisant et chaleureux ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":265,\"question\":\"Les sols étaient-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":266,\"question\":\"Les meubles et présentoirs étaient-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":267,\"question\":\"Les testeurs étaient-ils propres et utilisables ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":268,\"section_header\":\"4. ORGANISATION DES RAYONS (OUI / NON)\",\"responses\":[{\"question_id\":269,\"question\":\"Les rayons étaient-ils bien rangés ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":270,\"question\":\"Les produits étaient-ils faciles à identifier ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":271,\"question\":\"Les prix étaient-ils clairement affichés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":272,\"question\":\"Les promotions étaient-elles clairement signalées ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":273,\"question\":\"Les produits des gammes testées étaient disponibles ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":274,\"section_header\":\"5. APPARENCE &amp; TENUE DE LA CONSEILLÈRE (OUI / NON)\",\"responses\":[{\"question_id\":275,\"question\":\"La conseillère portait-elle l’uniforme Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":276,\"question\":\"L’uniforme était-il propre et soigné ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":277,\"question\":\"Les cheveux étaient-ils propres et bien coiffés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":278,\"question\":\"Les ongles étaient-ils propres et soignés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":279,\"question\":\"L’apparence globale était-elle professionnelle ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":280,\"section_header\":\"6. ACCUEIL &amp; POSTURE COMMERCIALE (OUI / NON)\",\"responses\":[{\"question_id\":281,\"question\":\"J’ai été saluée à l’entrée ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":282,\"question\":\"La prise de contact a-t-elle été rapide ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":283,\"question\":\"La conseillère a-t-elle souri chaleureusement ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":284,\"question\":\"La conseillère a-t-elle été aimable ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":285,\"question\":\"L’attitude était-elle naturelle et professionnelle ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":286,\"section_header\":\"7. DÉCOUVERTE DES BESOINS CLIENTE (OUI / NON)\",\"responses\":[{\"question_id\":287,\"question\":\"La conseillère me demande mon type de peau ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":288,\"question\":\"A-t-elle demandé l’âge ou les préoccupations principales ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":289,\"question\":\"A-t-elle posé des questions sur la routine actuelle ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":290,\"question\":\"La conseillère me pose des questions concernant mes besoins ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":291,\"question\":\"A-t-elle personnalisé son conseil ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":292,\"section_header\":\"8. QUALITÉ DU CONSEIL PRODUIT (OUI / NON)\",\"responses\":[{\"question_id\":293,\"question\":\"La conseillère a-t-elle expliqué les bénéfices des produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":294,\"question\":\"A-t-elle expliqué comment utiliser les produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":295,\"question\":\"A-t-elle comparé plusieurs produits ou gammes ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":296,\"question\":\"A-t-elle proposé une routine complète ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":297,\"question\":\"A-t-elle utilisé ou proposé des testeurs ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":298,\"section_header\":\"9. RECRUTEMENT FIDÉLITÉ (SI NOUVELLE CLIENTE)\",\"responses\":[{\"question_id\":299,\"question\":\"La conseillère a-t-elle demandé si vous étiez cliente Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":300,\"question\":\"A-t-elle proposé le programme de fidélité ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":301,\"question\":\"A-t-elle expliqué clairement les avantages ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":302,\"question\":\"A-t-elle proposé une inscription immédiate ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":303,\"section_header\":\"10. CONVICTION &amp; INTENTION D’ACHAT (RESSENTI CLIENTE)\",\"responses\":[{\"question_id\":304,\"question\":\"Vous êtes-vous sentie écoutée ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":305,\"question\":\"Le conseil vous a-t-il semblé crédible et rassurant ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":306,\"question\":\"La conseillère vous a-t-elle donné confiance dans le produit ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":307,\"question\":\"En plus du produit conseillé, avez-vous acheté d’autres produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":308,\"question\":\"Le rapport qualité/prix vous a-t-il convaincue ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":309,\"question\":\"Le passage en caisse a été fluide ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":310,\"section_header\":\"11. RECOMMANDATION &amp; IMAGE DE MARQUE\",\"responses\":[{\"question_id\":311,\"question\":\"Recommanderiez-vous ce magasin Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":312,\"question\":\"Recommanderiez-vous l’enseigne Yves Rocher après cette visite ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":313,\"question\":\"Cette visite a-t-elle renforcé votre image positive de la marque ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":314,\"section_header\":\"12. SATISFACTION GLOBALE\",\"responses\":[{\"question_id\":315,\"question\":\"Êtes-vous satisfaite de votre expérience globale ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":316,\"question\":\"Avez-vous envie de revenir dans ce magasin ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":317,\"section_header\":\"13. COMMENTAIRES OBLIGATOIRES DU VISITEUR MYSTÈRE\",\"responses\":[{\"question_id\":318,\"question\":\"Point le plus positif observé\",\"type\":\"text\",\"value\":\"NA\"},{\"question_id\":319,\"question\":\"Point le plus négatif observé\",\"type\":\"text\",\"value\":\"NA\"}]}]', '2026-05-12 13:20:10', 'approved', NULL, 'Rabat 6', '753 BIS AVENUE MASSIRA, CITE YAACOUB EL MANSOUR', NULL, NULL, 'RABAT', 32, NULL),
(94, 60, 1, '[{\"section_id\":242,\"section_header\":\"1.INFORMATIONS SUR LE MAGAZIN\",\"responses\":[{\"question_id\":243,\"question\":\"Date de la visite\",\"type\":\"text\",\"value\":\"27/05/2026\"},{\"question_id\":244,\"question\":\"Heure d’arrivée\",\"type\":\"text\",\"value\":\"18h\"},{\"question_id\":245,\"question\":\"Ville\",\"type\":\"text\",\"value\":\"RABAT\"},{\"question_id\":246,\"question\":\"Nom / code du magasin\",\"type\":\"text\",\"value\":\"Rabat 6\"},{\"question_id\":247,\"question\":\"Profil cliente mystère\",\"type\":\"checkboxes\",\"value\":{\"Cliente existante\":true}},{\"question_id\":248,\"question\":\"Scénario testé\",\"type\":\"checkboxes\",\"value\":{\"Mixte (plusieurs gammes)\":true}}]},{\"section_id\":249,\"section_header\":\"2.OBSERVATION EXTÉRIEURE DU MAGASIN (OUI / NON)\",\"responses\":[{\"question_id\":250,\"question\":\"Le magasin est-il visible au loin ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":false,\"NON\":true}},{\"question_id\":251,\"question\":\"Les abords du magasin sont-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":252,\"question\":\"La devanture était-elle propre ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":253,\"question\":\"Le sol devant le magasin était-il propre ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":254,\"question\":\"La façade était-elle en bon état ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":255,\"question\":\"Le logo était-il visible et éclairé ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":256,\"question\":\"Les vitrines étaient-elles propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":257,\"question\":\"Les vitrines donnaient-elles envie d’entrer ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":258,\"question\":\"Les offres / nouveautés étaient-elles visibles en vitrine ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":259,\"section_header\":\"3. AMBIANCE &amp; PROPRETÉ INTÉRIEURE (OUI / NON)\",\"responses\":[{\"question_id\":260,\"question\":\"L’odeur à l’entrée était-elle agréable ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":261,\"question\":\"L’odeur correspondait-elle à l’univers Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":262,\"question\":\"La musique était-elle présente ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":263,\"question\":\"Le volume de la musique était-il adapté ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":264,\"question\":\"L’éclairage était-il suffisant et chaleureux ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":265,\"question\":\"Les sols étaient-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":266,\"question\":\"Les meubles et présentoirs étaient-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":267,\"question\":\"Les testeurs étaient-ils propres et utilisables ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":268,\"section_header\":\"4. ORGANISATION DES RAYONS (OUI / NON)\",\"responses\":[{\"question_id\":269,\"question\":\"Les rayons étaient-ils bien rangés ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":270,\"question\":\"Les produits étaient-ils faciles à identifier ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":271,\"question\":\"Les prix étaient-ils clairement affichés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":272,\"question\":\"Les promotions étaient-elles clairement signalées ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":273,\"question\":\"Les produits des gammes testées étaient disponibles ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":274,\"section_header\":\"5. APPARENCE &amp; TENUE DE LA CONSEILLÈRE (OUI / NON)\",\"responses\":[{\"question_id\":275,\"question\":\"La conseillère portait-elle l’uniforme Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":276,\"question\":\"L’uniforme était-il propre et soigné ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":277,\"question\":\"Les cheveux étaient-ils propres et bien coiffés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":278,\"question\":\"Les ongles étaient-ils propres et soignés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":279,\"question\":\"L’apparence globale était-elle professionnelle ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":280,\"section_header\":\"6. ACCUEIL &amp; POSTURE COMMERCIALE (OUI / NON)\",\"responses\":[{\"question_id\":281,\"question\":\"J’ai été saluée à l’entrée ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":282,\"question\":\"La prise de contact a-t-elle été rapide ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":283,\"question\":\"La conseillère a-t-elle souri chaleureusement ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":284,\"question\":\"La conseillère a-t-elle été aimable ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":285,\"question\":\"L’attitude était-elle naturelle et professionnelle ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":286,\"section_header\":\"7. DÉCOUVERTE DES BESOINS CLIENTE (OUI / NON)\",\"responses\":[{\"question_id\":287,\"question\":\"La conseillère me demande mon type de peau ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":288,\"question\":\"A-t-elle demandé l’âge ou les préoccupations principales ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":289,\"question\":\"A-t-elle posé des questions sur la routine actuelle ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":290,\"question\":\"La conseillère me pose des questions concernant mes besoins ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":291,\"question\":\"A-t-elle personnalisé son conseil ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":292,\"section_header\":\"8. QUALITÉ DU CONSEIL PRODUIT (OUI / NON)\",\"responses\":[{\"question_id\":293,\"question\":\"La conseillère a-t-elle expliqué les bénéfices des produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":294,\"question\":\"A-t-elle expliqué comment utiliser les produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":295,\"question\":\"A-t-elle comparé plusieurs produits ou gammes ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":296,\"question\":\"A-t-elle proposé une routine complète ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":297,\"question\":\"A-t-elle utilisé ou proposé des testeurs ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":298,\"section_header\":\"9. RECRUTEMENT FIDÉLITÉ (SI NOUVELLE CLIENTE)\",\"responses\":[{\"question_id\":299,\"question\":\"La conseillère a-t-elle demandé si vous étiez cliente Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":300,\"question\":\"A-t-elle proposé le programme de fidélité ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":301,\"question\":\"A-t-elle expliqué clairement les avantages ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":302,\"question\":\"A-t-elle proposé une inscription immédiate ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":303,\"section_header\":\"10. CONVICTION &amp; INTENTION D’ACHAT (RESSENTI CLIENTE)\",\"responses\":[{\"question_id\":304,\"question\":\"Vous êtes-vous sentie écoutée ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":305,\"question\":\"Le conseil vous a-t-il semblé crédible et rassurant ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":306,\"question\":\"La conseillère vous a-t-elle donné confiance dans le produit ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":307,\"question\":\"En plus du produit conseillé, avez-vous acheté d’autres produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":308,\"question\":\"Le rapport qualité/prix vous a-t-il convaincue ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":309,\"question\":\"Le passage en caisse a été fluide ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":310,\"section_header\":\"11. RECOMMANDATION &amp; IMAGE DE MARQUE\",\"responses\":[{\"question_id\":311,\"question\":\"Recommanderiez-vous ce magasin Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":312,\"question\":\"Recommanderiez-vous l’enseigne Yves Rocher après cette visite ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":313,\"question\":\"Cette visite a-t-elle renforcé votre image positive de la marque ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":314,\"section_header\":\"12. SATISFACTION GLOBALE\",\"responses\":[{\"question_id\":315,\"question\":\"Êtes-vous satisfaite de votre expérience globale ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":316,\"question\":\"Avez-vous envie de revenir dans ce magasin ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":317,\"section_header\":\"13. COMMENTAIRES OBLIGATOIRES DU VISITEUR MYSTÈRE\",\"responses\":[{\"question_id\":318,\"question\":\"Point le plus positif observé\",\"type\":\"text\",\"value\":\"NA\"},{\"question_id\":319,\"question\":\"Point le plus négatif observé\",\"type\":\"text\",\"value\":\"NA\"}]}]', '2026-05-12 13:20:10', 'paid', 'sera apparaitre en 48H', 'Rabat 6', '753 BIS AVENUE MASSIRA, CITE YAACOUB EL MANSOUR', NULL, NULL, 'RABAT', 30, 'REF225471F'),
(95, 60, 1, '[{\"section_id\":242,\"section_header\":\"1.INFORMATIONS SUR LE MAGAZIN\",\"responses\":[{\"question_id\":243,\"question\":\"Date de la visite\",\"type\":\"text\",\"value\":\"27/05/2026\"},{\"question_id\":244,\"question\":\"Heure d’arrivée\",\"type\":\"text\",\"value\":\"18h\"},{\"question_id\":245,\"question\":\"Ville\",\"type\":\"text\",\"value\":\"RABAT\"},{\"question_id\":246,\"question\":\"Nom / code du magasin\",\"type\":\"text\",\"value\":\"Rabat 6\"},{\"question_id\":247,\"question\":\"Profil cliente mystère\",\"type\":\"checkboxes\",\"value\":{\"Cliente existante\":true}},{\"question_id\":248,\"question\":\"Scénario testé\",\"type\":\"checkboxes\",\"value\":{\"Mixte (plusieurs gammes)\":true}}]},{\"section_id\":249,\"section_header\":\"2.OBSERVATION EXTÉRIEURE DU MAGASIN (OUI / NON)\",\"responses\":[{\"question_id\":250,\"question\":\"Le magasin est-il visible au loin ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":false,\"NON\":true}},{\"question_id\":251,\"question\":\"Les abords du magasin sont-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":252,\"question\":\"La devanture était-elle propre ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":253,\"question\":\"Le sol devant le magasin était-il propre ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":254,\"question\":\"La façade était-elle en bon état ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":255,\"question\":\"Le logo était-il visible et éclairé ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":256,\"question\":\"Les vitrines étaient-elles propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":257,\"question\":\"Les vitrines donnaient-elles envie d’entrer ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":258,\"question\":\"Les offres / nouveautés étaient-elles visibles en vitrine ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":259,\"section_header\":\"3. AMBIANCE &amp; PROPRETÉ INTÉRIEURE (OUI / NON)\",\"responses\":[{\"question_id\":260,\"question\":\"L’odeur à l’entrée était-elle agréable ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":261,\"question\":\"L’odeur correspondait-elle à l’univers Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":262,\"question\":\"La musique était-elle présente ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":263,\"question\":\"Le volume de la musique était-il adapté ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":264,\"question\":\"L’éclairage était-il suffisant et chaleureux ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":265,\"question\":\"Les sols étaient-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":266,\"question\":\"Les meubles et présentoirs étaient-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":267,\"question\":\"Les testeurs étaient-ils propres et utilisables ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":268,\"section_header\":\"4. ORGANISATION DES RAYONS (OUI / NON)\",\"responses\":[{\"question_id\":269,\"question\":\"Les rayons étaient-ils bien rangés ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":270,\"question\":\"Les produits étaient-ils faciles à identifier ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":271,\"question\":\"Les prix étaient-ils clairement affichés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":272,\"question\":\"Les promotions étaient-elles clairement signalées ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":273,\"question\":\"Les produits des gammes testées étaient disponibles ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":274,\"section_header\":\"5. APPARENCE &amp; TENUE DE LA CONSEILLÈRE (OUI / NON)\",\"responses\":[{\"question_id\":275,\"question\":\"La conseillère portait-elle l’uniforme Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":276,\"question\":\"L’uniforme était-il propre et soigné ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":277,\"question\":\"Les cheveux étaient-ils propres et bien coiffés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":278,\"question\":\"Les ongles étaient-ils propres et soignés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":279,\"question\":\"L’apparence globale était-elle professionnelle ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":280,\"section_header\":\"6. ACCUEIL &amp; POSTURE COMMERCIALE (OUI / NON)\",\"responses\":[{\"question_id\":281,\"question\":\"J’ai été saluée à l’entrée ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":282,\"question\":\"La prise de contact a-t-elle été rapide ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":283,\"question\":\"La conseillère a-t-elle souri chaleureusement ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":284,\"question\":\"La conseillère a-t-elle été aimable ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":285,\"question\":\"L’attitude était-elle naturelle et professionnelle ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":286,\"section_header\":\"7. DÉCOUVERTE DES BESOINS CLIENTE (OUI / NON)\",\"responses\":[{\"question_id\":287,\"question\":\"La conseillère me demande mon type de peau ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":288,\"question\":\"A-t-elle demandé l’âge ou les préoccupations principales ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":289,\"question\":\"A-t-elle posé des questions sur la routine actuelle ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":290,\"question\":\"La conseillère me pose des questions concernant mes besoins ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":291,\"question\":\"A-t-elle personnalisé son conseil ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":292,\"section_header\":\"8. QUALITÉ DU CONSEIL PRODUIT (OUI / NON)\",\"responses\":[{\"question_id\":293,\"question\":\"La conseillère a-t-elle expliqué les bénéfices des produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":294,\"question\":\"A-t-elle expliqué comment utiliser les produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":295,\"question\":\"A-t-elle comparé plusieurs produits ou gammes ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":296,\"question\":\"A-t-elle proposé une routine complète ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":297,\"question\":\"A-t-elle utilisé ou proposé des testeurs ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":298,\"section_header\":\"9. RECRUTEMENT FIDÉLITÉ (SI NOUVELLE CLIENTE)\",\"responses\":[{\"question_id\":299,\"question\":\"La conseillère a-t-elle demandé si vous étiez cliente Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":300,\"question\":\"A-t-elle proposé le programme de fidélité ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":301,\"question\":\"A-t-elle expliqué clairement les avantages ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":302,\"question\":\"A-t-elle proposé une inscription immédiate ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":303,\"section_header\":\"10. CONVICTION &amp; INTENTION D’ACHAT (RESSENTI CLIENTE)\",\"responses\":[{\"question_id\":304,\"question\":\"Vous êtes-vous sentie écoutée ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":305,\"question\":\"Le conseil vous a-t-il semblé crédible et rassurant ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":306,\"question\":\"La conseillère vous a-t-elle donné confiance dans le produit ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":307,\"question\":\"En plus du produit conseillé, avez-vous acheté d’autres produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":308,\"question\":\"Le rapport qualité/prix vous a-t-il convaincue ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":309,\"question\":\"Le passage en caisse a été fluide ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":310,\"section_header\":\"11. RECOMMANDATION &amp; IMAGE DE MARQUE\",\"responses\":[{\"question_id\":311,\"question\":\"Recommanderiez-vous ce magasin Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":312,\"question\":\"Recommanderiez-vous l’enseigne Yves Rocher après cette visite ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":313,\"question\":\"Cette visite a-t-elle renforcé votre image positive de la marque ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":314,\"section_header\":\"12. SATISFACTION GLOBALE\",\"responses\":[{\"question_id\":315,\"question\":\"Êtes-vous satisfaite de votre expérience globale ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":316,\"question\":\"Avez-vous envie de revenir dans ce magasin ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":317,\"section_header\":\"13. COMMENTAIRES OBLIGATOIRES DU VISITEUR MYSTÈRE\",\"responses\":[{\"question_id\":318,\"question\":\"Point le plus positif observé\",\"type\":\"text\",\"value\":\"NA\"},{\"question_id\":319,\"question\":\"Point le plus négatif observé\",\"type\":\"text\",\"value\":\"NA\"}]}]', '2026-05-12 13:20:10', 'refused', 'le rib incorrecte', 'Rabat 6', '753 BIS AVENUE MASSIRA, CITE YAACOUB EL MANSOUR', NULL, NULL, 'RABAT', 31, NULL);
INSERT INTO `reports` (`id`, `mission_id`, `user_id`, `answers`, `submitted_at`, `status`, `refusal_reason`, `nomMagazin`, `specificStoreAddress`, `scenario`, `dateTimeMission`, `ville`, `store_id`, `reference_paiement`) VALUES
(97, 60, 1, '[{\"section_id\":242,\"section_header\":\"1.INFORMATIONS SUR LE MAGAZIN\",\"responses\":[{\"question_id\":243,\"question\":\"Date de la visite\",\"type\":\"text\",\"value\":\"27/05/2026\"},{\"question_id\":244,\"question\":\"Heure d’arrivée\",\"type\":\"text\",\"value\":\"18h\"},{\"question_id\":245,\"question\":\"Ville\",\"type\":\"text\",\"value\":\"RABAT\"},{\"question_id\":246,\"question\":\"Nom / code du magasin\",\"type\":\"text\",\"value\":\"Rabat 6\"},{\"question_id\":247,\"question\":\"Profil cliente mystère\",\"type\":\"checkboxes\",\"value\":{\"Cliente existante\":true}},{\"question_id\":248,\"question\":\"Scénario testé\",\"type\":\"checkboxes\",\"value\":{\"Mixte (plusieurs gammes)\":true}}]},{\"section_id\":249,\"section_header\":\"2.OBSERVATION EXTÉRIEURE DU MAGASIN (OUI / NON)\",\"responses\":[{\"question_id\":250,\"question\":\"Le magasin est-il visible au loin ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":false,\"NON\":true}},{\"question_id\":251,\"question\":\"Les abords du magasin sont-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":252,\"question\":\"La devanture était-elle propre ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":253,\"question\":\"Le sol devant le magasin était-il propre ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":254,\"question\":\"La façade était-elle en bon état ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":255,\"question\":\"Le logo était-il visible et éclairé ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":256,\"question\":\"Les vitrines étaient-elles propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":257,\"question\":\"Les vitrines donnaient-elles envie d’entrer ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":258,\"question\":\"Les offres / nouveautés étaient-elles visibles en vitrine ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":259,\"section_header\":\"3. AMBIANCE &amp; PROPRETÉ INTÉRIEURE (OUI / NON)\",\"responses\":[{\"question_id\":260,\"question\":\"L’odeur à l’entrée était-elle agréable ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":261,\"question\":\"L’odeur correspondait-elle à l’univers Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":262,\"question\":\"La musique était-elle présente ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":263,\"question\":\"Le volume de la musique était-il adapté ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":264,\"question\":\"L’éclairage était-il suffisant et chaleureux ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":265,\"question\":\"Les sols étaient-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":266,\"question\":\"Les meubles et présentoirs étaient-ils propres ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":267,\"question\":\"Les testeurs étaient-ils propres et utilisables ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":268,\"section_header\":\"4. ORGANISATION DES RAYONS (OUI / NON)\",\"responses\":[{\"question_id\":269,\"question\":\"Les rayons étaient-ils bien rangés ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":270,\"question\":\"Les produits étaient-ils faciles à identifier ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":271,\"question\":\"Les prix étaient-ils clairement affichés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":272,\"question\":\"Les promotions étaient-elles clairement signalées ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":273,\"question\":\"Les produits des gammes testées étaient disponibles ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":274,\"section_header\":\"5. APPARENCE &amp; TENUE DE LA CONSEILLÈRE (OUI / NON)\",\"responses\":[{\"question_id\":275,\"question\":\"La conseillère portait-elle l’uniforme Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":276,\"question\":\"L’uniforme était-il propre et soigné ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":277,\"question\":\"Les cheveux étaient-ils propres et bien coiffés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":278,\"question\":\"Les ongles étaient-ils propres et soignés ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":279,\"question\":\"L’apparence globale était-elle professionnelle ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":280,\"section_header\":\"6. ACCUEIL &amp; POSTURE COMMERCIALE (OUI / NON)\",\"responses\":[{\"question_id\":281,\"question\":\"J’ai été saluée à l’entrée ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":282,\"question\":\"La prise de contact a-t-elle été rapide ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":283,\"question\":\"La conseillère a-t-elle souri chaleureusement ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":284,\"question\":\"La conseillère a-t-elle été aimable ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":285,\"question\":\"L’attitude était-elle naturelle et professionnelle ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":286,\"section_header\":\"7. DÉCOUVERTE DES BESOINS CLIENTE (OUI / NON)\",\"responses\":[{\"question_id\":287,\"question\":\"La conseillère me demande mon type de peau ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":288,\"question\":\"A-t-elle demandé l’âge ou les préoccupations principales ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":289,\"question\":\"A-t-elle posé des questions sur la routine actuelle ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":290,\"question\":\"La conseillère me pose des questions concernant mes besoins ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":291,\"question\":\"A-t-elle personnalisé son conseil ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":292,\"section_header\":\"8. QUALITÉ DU CONSEIL PRODUIT (OUI / NON)\",\"responses\":[{\"question_id\":293,\"question\":\"La conseillère a-t-elle expliqué les bénéfices des produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":294,\"question\":\"A-t-elle expliqué comment utiliser les produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":295,\"question\":\"A-t-elle comparé plusieurs produits ou gammes ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":296,\"question\":\"A-t-elle proposé une routine complète ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":297,\"question\":\"A-t-elle utilisé ou proposé des testeurs ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":298,\"section_header\":\"9. RECRUTEMENT FIDÉLITÉ (SI NOUVELLE CLIENTE)\",\"responses\":[{\"question_id\":299,\"question\":\"La conseillère a-t-elle demandé si vous étiez cliente Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":300,\"question\":\"A-t-elle proposé le programme de fidélité ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":301,\"question\":\"A-t-elle expliqué clairement les avantages ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":302,\"question\":\"A-t-elle proposé une inscription immédiate ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":303,\"section_header\":\"10. CONVICTION &amp; INTENTION D’ACHAT (RESSENTI CLIENTE)\",\"responses\":[{\"question_id\":304,\"question\":\"Vous êtes-vous sentie écoutée ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":305,\"question\":\"Le conseil vous a-t-il semblé crédible et rassurant ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":306,\"question\":\"La conseillère vous a-t-elle donné confiance dans le produit ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":307,\"question\":\"En plus du produit conseillé, avez-vous acheté d’autres produits ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":308,\"question\":\"Le rapport qualité/prix vous a-t-il convaincue ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":309,\"question\":\"Le passage en caisse a été fluide ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}}]},{\"section_id\":310,\"section_header\":\"11. RECOMMANDATION &amp; IMAGE DE MARQUE\",\"responses\":[{\"question_id\":311,\"question\":\"Recommanderiez-vous ce magasin Yves Rocher ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":312,\"question\":\"Recommanderiez-vous l’enseigne Yves Rocher après cette visite ?\",\"type\":\"checkboxes\",\"value\":{\"OUI\":true}},{\"question_id\":313,\"question\":\"Cette visite a-t-elle renforcé votre image positive de la marque ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":314,\"section_header\":\"12. SATISFACTION GLOBALE\",\"responses\":[{\"question_id\":315,\"question\":\"Êtes-vous satisfaite de votre expérience globale ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}},{\"question_id\":316,\"question\":\"Avez-vous envie de revenir dans ce magasin ?\",\"type\":\"checkboxes\",\"value\":{\"NON\":true}}]},{\"section_id\":317,\"section_header\":\"13. COMMENTAIRES OBLIGATOIRES DU VISITEUR MYSTÈRE\",\"responses\":[{\"question_id\":318,\"question\":\"Point le plus positif observé\",\"type\":\"text\",\"value\":\"NA\"},{\"question_id\":319,\"question\":\"Point le plus négatif observé\",\"type\":\"text\",\"value\":\"NA\"}]}]', '2026-05-12 13:20:10', 'approved', NULL, 'Rabat 6', '753 BIS AVENUE MASSIRA, CITE YAACOUB EL MANSOUR', NULL, NULL, 'RABAT', 33, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `city` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `category` varchar(100) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `stores`
--

INSERT INTO `stores` (`id`, `mission_id`, `name`, `city`, `address`, `latitude`, `longitude`, `category`, `active`, `created_at`, `updated_at`) VALUES
(3, 2, 'Gourmet Place - Downtown', 'CASABLANCA', '123 Fine Dining St', 34.0550000, -118.2450000, 'Restaurant', 1, '2026-02-13 15:03:55', '2026-05-12 10:37:59'),
(5, 2, 'Atlas Coffee - Rabat Center', 'RABAT', '12 Avenue Mohammed V', 34.0209000, -6.8416000, 'Cafe', 1, '2026-02-13 15:05:09', '2026-05-12 10:38:07'),
(6, 2, 'Medina Bites - Fes Old Town', 'FES', '45 Derb Medina', 34.0181000, -5.0078000, 'Restaurant', 1, '2026-02-13 15:05:09', '2026-05-12 10:38:13'),
(7, 2, 'Ocean Mall Food Court', 'CASABLANCA', 'Boulevard Zerktouni', 33.5731000, -7.5898000, 'Food Court', 1, '2026-02-13 15:05:09', '2026-05-12 10:38:25'),
(27, 60, 'Magasin Tachefine Mall', 'CASABLANCA', 'N°R11, Centre Commercial Ibn Tachfine Casablanca', 46.5731104, -7.5898434, 'Retail', 1, '2026-05-12 10:29:40', '2026-06-26 11:13:40'),
(28, 60, 'Casa 2 mars', 'CASABLANCA', '50 RESIDENCE BAYROUTE AVENUE 2 MARS', 31.5731104, -7.5898434, 'Retail', 1, '2026-05-12 10:30:38', '2026-06-26 11:13:50'),
(29, 60, 'Casa Marjane Californie', 'CASABLANCA', '13, CENTRE COMMERCIAL MARJANE', 30.5731104, -7.5898434, 'Retail', 1, '2026-05-12 10:31:32', '2026-06-26 11:13:57'),
(30, 60, 'Magasin LG', 'CASABLANCA', '13, CENTRE COMMERCIAL MARJANE', 33.5731104, -7.5898434, 'Retail', 1, '2026-05-12 10:32:26', '2026-05-12 10:32:26'),
(31, 60, ' Casa Ben Omar', 'CASABLANCA', 'CENTRE BEN OMAR. 21 RUE ABOU ABDELLAH NAFII', 39.5731104, -7.5898434, 'Retail', 1, '2026-05-12 10:33:01', '2026-06-26 11:14:07'),
(32, 60, 'Rabat Hay Riad ', 'RABAT', 'N° 9 CENTRE COMMERCIAL MARJANE HAY RIAD', 33.5731104, -6.5898434, 'Retail', 1, '2026-05-12 10:33:44', '2026-06-26 11:14:17'),
(33, 60, 'Rabat 6', 'RABAT', '753 BIS AVENUE MASSIRA, CITE YAACOUB EL MANSOUR', 33.5731104, -4.5898434, 'Retail', 1, '2026-05-12 10:34:28', '2026-06-26 11:14:30'),
(34, 60, ' Arribat Center', 'RABAT', 'C0.109, ARRIBAT CENTER, S.A RABAT', 33.5731104, -10.5898434, 'Retail', 1, '2026-05-12 10:34:56', '2026-06-26 11:14:36'),
(35, 60, 'Carre Eden', 'MARRAKECH', 'B32 Centre Commercial Carré Eden Gueliz', 33.2031104, -7.5898434, 'Retail', 1, '2026-05-12 10:35:54', '2026-06-26 11:14:49'),
(36, 60, 'Institut', 'MARRAKECH', 'Magasin 157, Boulevard Med V Gueliz, Marrakech', 33.9731104, -7.5898434, 'Retail', 1, '2026-05-12 10:36:22', '2026-06-26 11:15:07'),
(37, 60, 'Agadir Sela Park', 'MARRAKECH', 'Route Nationale n°1, angle route Nationale, Agadir', 33.7731104, -6.5898434, 'Retail', 1, '2026-05-12 10:36:51', '2026-06-26 11:15:28');

-- --------------------------------------------------------

--
-- Structure de la table `survey_questions`
--

CREATE TABLE `survey_questions` (
  `id` int(11) NOT NULL COMMENT 'Unique question ID',
  `mission_id` int(11) NOT NULL COMMENT 'Associated mission ID',
  `type` enum('rating','multiple_choice','text','image_upload','checkboxes','gps_capture','audio_recording','section_header','info_text') NOT NULL COMMENT 'Type of the question',
  `text` text NOT NULL COMMENT 'The actual question text',
  `is_required` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Is the question mandatory?',
  `max_rating` int(11) DEFAULT NULL COMMENT 'Only for rating questions',
  `min_label` varchar(100) DEFAULT NULL COMMENT 'Only for rating questions',
  `max_label` varchar(100) DEFAULT NULL COMMENT 'Only for rating questions',
  `allow_multiple` tinyint(1) DEFAULT NULL COMMENT 'Only for image_upload or checkboxes',
  `max_images` int(11) DEFAULT NULL COMMENT 'Only for image_upload type',
  `max_duration_seconds` int(11) DEFAULT NULL COMMENT 'Only for audio_recording type',
  `options_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Store options as JSON array if needed (e.g., for multiple_choice, checkboxes)'
) ;

--
-- Déchargement des données de la table `survey_questions`
--

INSERT INTO `survey_questions` (`id`, `mission_id`, `type`, `text`, `is_required`, `max_rating`, `min_label`, `max_label`, `allow_multiple`, `max_images`, `max_duration_seconds`, `options_json`) VALUES
(242, 60, 'section_header', '1.INFORMATIONS SUR LE MAGAZIN', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(243, 60, 'text', 'Date de la visite', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(244, 60, 'text', 'Heure d’arrivée', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(245, 60, 'text', 'Ville', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(246, 60, 'text', 'Nom / code du magasin', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(247, 60, 'checkboxes', 'Profil cliente mystère', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579238050,\"text\":\"Nouvelle cliente (recrutement)\"},{\"id\":1778579255539,\"text\":\"Cliente existante\"}]'),
(248, 60, 'checkboxes', 'Scénario testé', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579285514,\"text\":\"Glow Énergie\"},{\"id\":1778579321215,\"text\":\"Lift Pro Collagène\"},{\"id\":1778579329523,\"text\":\"Anti-Âge\"},{\"id\":1778579370635,\"text\":\"Mixte (plusieurs gammes)\"}]'),
(249, 60, 'section_header', '2.OBSERVATION EXTÉRIEURE DU MAGASIN (OUI / NON)', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(250, 60, 'checkboxes', 'Le magasin est-il visible au loin ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579418050,\"text\":\"OUI\"},{\"id\":1778579425015,\"text\":\"NON\"}]'),
(251, 60, 'checkboxes', 'Les abords du magasin sont-ils propres ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579431624,\"text\":\"OUI\"},{\"id\":1778579453286,\"text\":\"NON\"}]'),
(252, 60, 'checkboxes', 'La devanture était-elle propre ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579535086,\"text\":\"OUI\"},{\"id\":1778579540889,\"text\":\"NON\"}]'),
(253, 60, 'checkboxes', 'Le sol devant le magasin était-il propre ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579557144,\"text\":\"OUI\"},{\"id\":1778579562919,\"text\":\"NON\"}]'),
(254, 60, 'checkboxes', 'La façade était-elle en bon état ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579567530,\"text\":\"OUI\"},{\"id\":1778579581251,\"text\":\"NON\"}]'),
(255, 60, 'checkboxes', 'Le logo était-il visible et éclairé ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579594156,\"text\":\"OUI\"},{\"id\":1778579600098,\"text\":\"NON\"}]'),
(256, 60, 'checkboxes', 'Les vitrines étaient-elles propres ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579611756,\"text\":\"OUI\"},{\"id\":1778579617105,\"text\":\"NON\"}]'),
(257, 60, 'checkboxes', 'Les vitrines donnaient-elles envie d’entrer ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579621938,\"text\":\"OUI\"},{\"id\":1778579637576,\"text\":\"NON\"}]'),
(258, 60, 'checkboxes', 'Les offres / nouveautés étaient-elles visibles en vitrine ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579649549,\"text\":\"OUI\"},{\"id\":1778579655613,\"text\":\"NON\"}]'),
(259, 60, 'section_header', '3. AMBIANCE &amp; PROPRETÉ INTÉRIEURE (OUI / NON)', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(260, 60, 'checkboxes', 'L’odeur à l’entrée était-elle agréable ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579752143,\"text\":\"OUI\"},{\"id\":1778579776018,\"text\":\"NON\"}]'),
(261, 60, 'checkboxes', 'L’odeur correspondait-elle à l’univers Yves Rocher ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579781702,\"text\":\"OUI\"},{\"id\":1778579796557,\"text\":\"NON\"}]'),
(262, 60, 'checkboxes', 'La musique était-elle présente ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579802336,\"text\":\"OUI\"},{\"id\":1778579816303,\"text\":\"NON\"}]'),
(263, 60, 'checkboxes', 'Le volume de la musique était-il adapté ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579829482,\"text\":\"OUI\"},{\"id\":1778579835432,\"text\":\"NON\"}]'),
(264, 60, 'checkboxes', 'L’éclairage était-il suffisant et chaleureux ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579850120,\"text\":\"OUI\"},{\"id\":1778579855864,\"text\":\"NON\"}]'),
(265, 60, 'checkboxes', 'Les sols étaient-ils propres ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579867640,\"text\":\"OUI\"},{\"id\":1778579874049,\"text\":\"NON\"}]'),
(266, 60, 'checkboxes', 'Les meubles et présentoirs étaient-ils propres ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579888268,\"text\":\"OUI\"},{\"id\":1778579893767,\"text\":\"NON\"}]'),
(267, 60, 'checkboxes', 'Les testeurs étaient-ils propres et utilisables ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579899094,\"text\":\"OUI\"},{\"id\":1778579911434,\"text\":\"NON\"}]'),
(268, 60, 'section_header', '4. ORGANISATION DES RAYONS (OUI / NON)', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(269, 60, 'checkboxes', 'Les rayons étaient-ils bien rangés ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579930271,\"text\":\"OUI\"},{\"id\":1778579947457,\"text\":\"NON\"}]'),
(270, 60, 'checkboxes', 'Les produits étaient-ils faciles à identifier ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579962199,\"text\":\"OUI\"},{\"id\":1778579967860,\"text\":\"NON\"}]'),
(271, 60, 'checkboxes', 'Les prix étaient-ils clairement affichés ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579979945,\"text\":\"OUI\"},{\"id\":1778579985402,\"text\":\"NON\"}]'),
(272, 60, 'checkboxes', 'Les promotions étaient-elles clairement signalées ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579989011,\"text\":\"OUI\"},{\"id\":1778580004253,\"text\":\"NON\"}]'),
(273, 60, 'checkboxes', 'Les produits des gammes testées étaient disponibles ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580017760,\"text\":\"OUI\"},{\"id\":1778580027741,\"text\":\"NON\"}]'),
(274, 60, 'section_header', '5. APPARENCE &amp; TENUE DE LA CONSEILLÈRE (OUI / NON)', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(275, 60, 'checkboxes', 'La conseillère portait-elle l’uniforme Yves Rocher ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580083859,\"text\":\"OUI\"},{\"id\":1778580089055,\"text\":\"NON\"}]'),
(276, 60, 'checkboxes', 'L’uniforme était-il propre et soigné ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580099933,\"text\":\"OUI\"},{\"id\":1778580113453,\"text\":\"NON\"}]'),
(277, 60, 'checkboxes', 'Les cheveux étaient-ils propres et bien coiffés ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580124904,\"text\":\"OUI\"},{\"id\":1778580129781,\"text\":\"NON\"}]'),
(278, 60, 'checkboxes', 'Les ongles étaient-ils propres et soignés ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580142376,\"text\":\"OUI\"},{\"id\":1778580149332,\"text\":\"NON\"}]'),
(279, 60, 'checkboxes', 'L’apparence globale était-elle professionnelle ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580161657,\"text\":\"OUI\"},{\"id\":1778580166763,\"text\":\"NON\"}]'),
(280, 60, 'section_header', '6. ACCUEIL &amp; POSTURE COMMERCIALE (OUI / NON)', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(281, 60, 'checkboxes', 'J’ai été saluée à l’entrée ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580223694,\"text\":\"OUI\"},{\"id\":1778580242216,\"text\":\"NON\"}]'),
(282, 60, 'checkboxes', 'La prise de contact a-t-elle été rapide ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580247573,\"text\":\"OUI\"},{\"id\":1778580265126,\"text\":\"NON\"}]'),
(283, 60, 'checkboxes', 'La conseillère a-t-elle souri chaleureusement ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580278702,\"text\":\"OUI\"},{\"id\":1778580284313,\"text\":\"NON\"}]'),
(284, 60, 'checkboxes', 'La conseillère a-t-elle été aimable ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580291684,\"text\":\"OUI\"},{\"id\":1778580307174,\"text\":\"NON\"}]'),
(285, 60, 'checkboxes', 'L’attitude était-elle naturelle et professionnelle ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580319411,\"text\":\"OUI\"},{\"id\":1778580328540,\"text\":\"NON\"}]'),
(286, 60, 'section_header', '7. DÉCOUVERTE DES BESOINS CLIENTE (OUI / NON)', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(287, 60, 'checkboxes', 'La conseillère me demande mon type de peau ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580783712,\"text\":\"OUI\"},{\"id\":1778580789175,\"text\":\"NON\"}]'),
(288, 60, 'checkboxes', 'A-t-elle demandé l’âge ou les préoccupations principales ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580793634,\"text\":\"OUI\"},{\"id\":1778580807573,\"text\":\"NON\"}]'),
(289, 60, 'checkboxes', 'A-t-elle posé des questions sur la routine actuelle ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580819451,\"text\":\"OUI\"},{\"id\":1778580825165,\"text\":\"NON\"}]'),
(290, 60, 'checkboxes', 'La conseillère me pose des questions concernant mes besoins ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580838427,\"text\":\"OUI\"},{\"id\":1778580843890,\"text\":\"NON\"}]'),
(291, 60, 'checkboxes', 'A-t-elle personnalisé son conseil ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580861978,\"text\":\"OUI\"},{\"id\":1778580867162,\"text\":\"NON\"}]'),
(292, 60, 'section_header', '8. QUALITÉ DU CONSEIL PRODUIT (OUI / NON)', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(293, 60, 'checkboxes', 'La conseillère a-t-elle expliqué les bénéfices des produits ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580897492,\"text\":\"OUI\"},{\"id\":1778580904151,\"text\":\"NON\"}]'),
(294, 60, 'checkboxes', 'A-t-elle expliqué comment utiliser les produits ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580920069,\"text\":\"OUI\"},{\"id\":1778580925837,\"text\":\"NON\"}]'),
(295, 60, 'checkboxes', 'A-t-elle comparé plusieurs produits ou gammes ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580930055,\"text\":\"OUI\"},{\"id\":1778580944454,\"text\":\"NON\"}]'),
(296, 60, 'checkboxes', 'A-t-elle proposé une routine complète ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580956087,\"text\":\"OUI\"},{\"id\":1778580961369,\"text\":\"NON\"}]'),
(297, 60, 'checkboxes', 'A-t-elle utilisé ou proposé des testeurs ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778580973410,\"text\":\"OUI\"},{\"id\":1778580978508,\"text\":\"NON\"}]'),
(298, 60, 'section_header', '9. RECRUTEMENT FIDÉLITÉ (SI NOUVELLE CLIENTE)', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(299, 60, 'checkboxes', 'La conseillère a-t-elle demandé si vous étiez cliente Yves Rocher ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581010959,\"text\":\"OUI\"},{\"id\":1778581016960,\"text\":\"NON\"}]'),
(300, 60, 'checkboxes', 'A-t-elle proposé le programme de fidélité ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581028063,\"text\":\"OUI\"},{\"id\":1778581033372,\"text\":\"NON\"}]'),
(301, 60, 'checkboxes', 'A-t-elle expliqué clairement les avantages ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581045798,\"text\":\"OUI\"},{\"id\":1778581051303,\"text\":\"NON\"}]'),
(302, 60, 'checkboxes', 'A-t-elle proposé une inscription immédiate ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581062630,\"text\":\"OUI\"},{\"id\":1778581068319,\"text\":\"NON\"}]'),
(303, 60, 'section_header', '10. CONVICTION &amp; INTENTION D’ACHAT (RESSENTI CLIENTE)', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(304, 60, 'checkboxes', 'Vous êtes-vous sentie écoutée ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581097164,\"text\":\"OUI\"},{\"id\":1778581102792,\"text\":\"NON\"}]'),
(305, 60, 'checkboxes', 'Le conseil vous a-t-il semblé crédible et rassurant ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581115684,\"text\":\"OUI\"},{\"id\":1778581121653,\"text\":\"NON\"}]'),
(306, 60, 'checkboxes', 'La conseillère vous a-t-elle donné confiance dans le produit ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581139940,\"text\":\"OUI\"},{\"id\":1778581146088,\"text\":\"NON\"}]'),
(307, 60, 'checkboxes', 'En plus du produit conseillé, avez-vous acheté d’autres produits ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581151086,\"text\":\"OUI\"},{\"id\":1778581165936,\"text\":\"NON\"}]'),
(308, 60, 'checkboxes', 'Le rapport qualité/prix vous a-t-il convaincue ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581181329,\"text\":\"OUI\"},{\"id\":1778581187504,\"text\":\"NON\"}]'),
(309, 60, 'checkboxes', 'Le passage en caisse a été fluide ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581198606,\"text\":\"OUI\"},{\"id\":1778581210910,\"text\":\"NON\"}]'),
(310, 60, 'section_header', '11. RECOMMANDATION &amp; IMAGE DE MARQUE', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(311, 60, 'checkboxes', 'Recommanderiez-vous ce magasin Yves Rocher ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581242242,\"text\":\"OUI\"},{\"id\":1778581248050,\"text\":\"NON\"}]'),
(312, 60, 'checkboxes', 'Recommanderiez-vous l’enseigne Yves Rocher après cette visite ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581261561,\"text\":\"OUI\"},{\"id\":1778581268234,\"text\":\"NON\"}]'),
(313, 60, 'checkboxes', 'Cette visite a-t-elle renforcé votre image positive de la marque ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581279624,\"text\":\"OUI\"},{\"id\":1778581285488,\"text\":\"NON\"}]'),
(314, 60, 'section_header', '12. SATISFACTION GLOBALE', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(315, 60, 'checkboxes', 'Êtes-vous satisfaite de votre expérience globale ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581314577,\"text\":\"OUI\"},{\"id\":1778581320517,\"text\":\"NON\"}]'),
(316, 60, 'checkboxes', 'Avez-vous envie de revenir dans ce magasin ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778581324827,\"text\":\"OUI\"},{\"id\":1778581337929,\"text\":\"NON\"}]'),
(317, 60, 'section_header', '13. COMMENTAIRES OBLIGATOIRES DU VISITEUR MYSTÈRE', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(318, 60, 'text', 'Point le plus positif observé', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(319, 60, 'text', 'Point le plus négatif observé', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(326, 60, 'text', 'Date de la visite', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(327, 60, 'text', 'Heure d\'arrivée', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(328, 60, 'text', 'Ville', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(329, 60, 'text', 'Nom / code du magasin', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(330, 60, 'checkboxes', 'Profil cliente mystère', 0, NULL, NULL, NULL, 1, NULL, NULL, '[{\"id\":1778579238050,\"text\":\"Nouvelle cliente (recrutement)\"},{\"id\":1778579255539,\"text\":\"Cliente existante\"}]'),
(331, 60, 'checkboxes', 'Scénario testé', 0, NULL, NULL, NULL, 1, NULL, NULL, '[{\"id\":1778579285514,\"text\":\"Glow Énergie\"},{\"id\":1778579321215,\"text\":\"Lift Pro Collagène\"},{\"id\":1778579329523,\"text\":\"Anti-Âge\"},{\"id\":1778579370635,\"text\":\"Mixte (plusieurs gammes)\"}]'),
(332, 60, 'section_header', '2.OBSERVATION EXTÉRIEURE DU MAGASIN (OUI / NON)', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(333, 60, 'multiple_choice', 'Le magasin est-il visible au loin ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579418050,\"text\":\"OUI\"},{\"id\":1778579425015,\"text\":\"NON\"}]'),
(334, 60, 'multiple_choice', 'Les abords du magasin sont-ils propres ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579431624,\"text\":\"OUI\"},{\"id\":1778579453286,\"text\":\"NON\"}]'),
(335, 60, 'multiple_choice', 'La devanture était-elle propre ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579535086,\"text\":\"OUI\"},{\"id\":1778579540889,\"text\":\"NON\"}]'),
(336, 60, 'multiple_choice', 'Le sol devant le magasin était-il propre ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579557144,\"text\":\"OUI\"},{\"id\":1778579562919,\"text\":\"NON\"}]'),
(337, 60, 'multiple_choice', 'La façade était-elle en bon état ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579567530,\"text\":\"OUI\"},{\"id\":1778579581251,\"text\":\"NON\"}]'),
(338, 60, 'multiple_choice', 'Le logo était-il visible et éclairé ?', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1778579594156,\"text\":\"OUI\"},{\"id\":1778579600098,\"text\":\"NON\"}]'),
(345, 74, 'section_header', 'rrrr', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(346, 74, 'text', 'ttttt', 0, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(347, 74, 'multiple_choice', 'uuuu', 0, NULL, NULL, NULL, 0, NULL, NULL, '[{\"id\":1782918450394,\"text\":\"rrr\"},{\"id\":1782918456896,\"text\":\"ttttt\"}]');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'User''s full name',
  `email` varchar(255) NOT NULL COMMENT 'User''s unique email address',
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `role` enum('shopper','admin','client') NOT NULL DEFAULT 'shopper' COMMENT 'User role',
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
(1, 'Alice Johnson', 'alice.johnson@example.com', '$2b$10$Wue68THxILZ/cs561nW7FuShONyHugyVToB7pv7fY7fukUN6jf.eW', 'shopper', 'active', '2026-01-16 10:16:52', 'https://gravatar.com/avatar/78b225d16a56f009387c91cc6d66e4be?s=400&d=robohash&r=x', 'casablanca', '+1234567890', 'I love exploring new places and giving feedback to improve services.', 'https://example.com/cv/alice.pdf', 1990, 'female', 7),
(2, 'Bob Smith', 'fattah@gmail.com', '$2b$10$Wue68THxILZ/cs561nW7FuShONyHugyVToB7pv7fY7fukUN6jf.eW', 'admin', 'active', '2025-05-06 10:16:52', 'https://gravatar.com/avatar/29c6af8f4ed0a673a83162700a1d2296?s=400&d=robohash&r=x', 'casablanca', '+1234567891', 'Mystery shopping helps me stay engaged and observant.', 'https://example.com/cv/bob.pdf', 1985, 'male', 3),
(3, 'Carol Davis', 'carol.davis@example.com', '$2b$10$Wue68THxILZ/cs561nW7FuShONyHugyVToB7pv7fY7fukUN6jf.eW', 'shopper', 'active', '2025-05-06 10:16:52', 'https://gravatar.com/avatar/9c66789992879d53fc8c6e366eae3a8f?s=400&d=robohash&r=x', 'casablanca', '+1234567892', 'It’s exciting to be part of a system that enhances customer service.', 'https://example.com/cv/carol.pdf', 1992, 'female', 2),
(4, 'David Thompson', 'david.thompson@example.com', '$2b$10$Wue68THxILZ/cs561nW7FuShONyHugyVToB7pv7fY7fukUN6jf.eW', 'shopper', 'active', '2025-05-06 10:16:52', 'https://gravatar.com/avatar/d297bd5b29b60931466a0cadf544ebdd?s=400&d=robohash&r=x', 'rabat', '+1234567893', 'I enjoy evaluating real-world service experiences.', 'https://example.com/cv/david.pdf', 1988, 'male', 4),
(5, 'Eve Martinez', 'eve.martinez@example.com', '$2b$10$Wue68THxILZ/cs561nW7FuShONyHugyVToB7pv7fY7fukUN6jf.eW', 'client', 'active', '2025-05-06 10:16:52', 'https://gravatar.com/avatar/cf2ad37706afe48a36c2dbd7bf3508cf?s=400&d=robohash&r=x', 'rabat', '+1234567894', 'Mystery shopping lets me contribute to quality control.', 'https://example.com/cv/eve.pdf', 1995, 'female', 1),
(6, 'Franklin Lee', 'franklin.lee@example.com', '$2b$10$Wue68THxILZ/cs561nW7FuShONyHugyVToB7pv7fY7fukUN6jf.eW', 'client', 'active', '2025-05-06 10:16:52', 'https://gravatar.com/avatar/67b42f10cff6d8933307d03b471b7662?s=400&d=robohash&r=x', 'fes', '+1234567895', 'I find satisfaction in helping brands improve.', 'https://example.com/cv/franklin.pdf', 1987, 'male', 0),
(7, 'elmabtoul abdel fettah', 'elmabtoul@gmail.com', '$2b$10$Wue68THxILZ/cs561nW7FuShONyHugyVToB7pv7fY7fukUN6jf.eW', 'client', 'active', '2025-05-27 18:05:04', NULL, NULL, '0622364010', NULL, NULL, NULL, 'prefer_not_say', 0),
(9, 'salma sara', 'salma.sara@example.com', '$2b$10$pP5DqVdgAuMX//SAx3jZxOouTyPUcoP4aMdhyKQUNgpUqUaXSjzCy', 'shopper', 'active', '2025-07-24 07:55:25', NULL, NULL, 'salma.sara@example.com', NULL, NULL, NULL, 'prefer_not_say', 0),
(12, 'hanane', 'hnn@gmail.com', '$2b$10$Wue68THxILZ/cs561nW7FuShONyHugyVToB7pv7fY7fukUN6jf.eW', 'shopper', 'active', '2025-08-29 14:16:30', NULL, NULL, '+123', NULL, NULL, NULL, 'prefer_not_say', 0),
(13, 'helloman', 'helloman@gmail.com', '$2b$10$Wue68THxILZ/cs561nW7FuShONyHugyVToB7pv7fY7fukUN6jf.eW', 'shopper', 'active', '2025-10-06 16:14:36', NULL, NULL, '066666', NULL, NULL, NULL, 'prefer_not_say', 0),
(14, 'toto', 'toto@gmail.com', '$2b$10$SkQvFpSdIGDijunX9dSfMujhRDd5O9ORjxoSsKF7rtryXFKE9A75u', 'shopper', 'active', '2026-07-06 15:07:18', NULL, NULL, '0622365241', NULL, NULL, NULL, 'prefer_not_say', 0);

-- --------------------------------------------------------

--
-- Structure de la table `user_notifications`
--

CREATE TABLE `user_notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `notification_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`notification_data`)),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Déchargement des données de la table `user_notifications`
--

INSERT INTO `user_notifications` (`id`, `user_id`, `user_email`, `user_name`, `type`, `notification_data`, `created_at`) VALUES
(1, 12, 'hnn@gmail.com', 'hanane', 'reportStatusPush', '{\"missionTitle\":\"Mr Bricolage – Maroc\",\"status\":\"approved\",\"reward\":\"10.00\",\"refusalReason\":null}', '2026-01-31 13:13:47');

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
-- Index pour la table `bank_info`
--
ALTER TABLE `bank_info`
  ADD PRIMARY KEY (`id`),
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
-- Index pour la table `mission_recognition_quizzes`
--
ALTER TABLE `mission_recognition_quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`);

--
-- Index pour la table `mission_recognition_results`
--
ALTER TABLE `mission_recognition_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_mission_user` (`mission_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `mission_recognition_settings`
--
ALTER TABLE `mission_recognition_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_mission` (`mission_id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`);

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
-- Index pour la table `user_notifications`
--
ALTER TABLE `user_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_notifications_user` (`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT pour la table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=118;

--
-- AUTO_INCREMENT pour la table `bank_info`
--
ALTER TABLE `bank_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT pour la table `missions`
--
ALTER TABLE `missions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `mission_recognition_quizzes`
--
ALTER TABLE `mission_recognition_quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `mission_recognition_results`
--
ALTER TABLE `mission_recognition_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `mission_recognition_settings`
--
ALTER TABLE `mission_recognition_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique question ID', AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT pour la table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT pour la table `survey_questions`
--
ALTER TABLE `survey_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique question ID';

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `user_notifications`
--
ALTER TABLE `user_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- Contraintes pour la table `bank_info`
--
ALTER TABLE `bank_info`
  ADD CONSTRAINT `bank_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `mission_recognition_quizzes`
--
ALTER TABLE `mission_recognition_quizzes`
  ADD CONSTRAINT `mission_recognition_quizzes_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `mission_recognition_results`
--
ALTER TABLE `mission_recognition_results`
  ADD CONSTRAINT `mission_recognition_results_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mission_recognition_results_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `mission_recognition_settings`
--
ALTER TABLE `mission_recognition_settings`
  ADD CONSTRAINT `mission_recognition_settings_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quiz_questions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`),
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD CONSTRAINT `survey_questions_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `missions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `user_notifications`
--
ALTER TABLE `user_notifications`
  ADD CONSTRAINT `fk_user_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

DELIMITER $$
--
-- Évènements
--
CREATE DEFINER=`root`@`localhost` EVENT `auto_complete_missions` ON SCHEDULE EVERY 1 HOUR STARTS '2026-01-27 10:51:04' ON COMPLETION NOT PRESERVE ENABLE DO UPDATE missions
  SET status = 'completed'
  WHERE status = 'available'
    AND deadline < NOW()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
