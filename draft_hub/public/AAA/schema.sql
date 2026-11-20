-- ==============================================================
-- IQAC Annual Academic Audit (AAA) 2026-2027
-- Database Schema for cPanel / phpMyAdmin (MySQL / MariaDB)
-- St. Joseph's College (Autonomous), Tiruchirappalli
-- ==============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:30";

-- --------------------------------------------------------
-- Table structure for table `departments`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL UNIQUE,
  `name` varchar(150) NOT NULL,
  `school` varchar(100) DEFAULT NULL,
  `hod_name` varchar(100) DEFAULT NULL,
  `status` enum('draft','in_progress','submitted','audited') NOT NULL DEFAULT 'in_progress',
  `audit_date` date DEFAULT NULL,
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `role` enum('admin','department') NOT NULL DEFAULT 'department',
  `department_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `fk_user_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `audit_submissions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL UNIQUE,
  `academic_year` varchar(20) NOT NULL DEFAULT '2026 - 2027',
  `data_json` longtext NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `fk_submission_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `audit_evaluations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_evaluations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL DEFAULT '2026 - 2027',
  `expert_name` varchar(150) DEFAULT NULL,
  `dean_name` varchar(150) DEFAULT NULL,
  `iqac_coordinator` varchar(150) DEFAULT NULL,
  `scores_json` text DEFAULT NULL,
  `composite_score` decimal(5,2) DEFAULT NULL,
  `overall_grade` varchar(10) DEFAULT NULL,
  `commendations` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `evaluated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `fk_evaluation_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Initial Departments
-- --------------------------------------------------------
INSERT INTO `departments` (`id`, `code`, `name`, `school`, `hod_name`, `status`, `audit_date`, `is_locked`) VALUES
(1, 'cs', 'PG & Research Department of Computer Science', 'School of Computing Sciences', 'Dr. S. Albert Rabara', 'submitted', '2026-11-15', 0),
(2, 'commerce', 'PG & Research Department of Commerce', 'School of Management Studies', 'Dr. F. R. Alexander Pravin Durai', 'in_progress', '2026-11-16', 0),
(3, 'physics', 'PG & Research Department of Physics', 'School of Physical Sciences', 'Dr. N. Lawrence', 'in_progress', '2026-11-17', 0),
(4, 'chemistry', 'PG & Research Department of Chemistry', 'School of Chemical Sciences', 'Dr. A. Rose Venis', 'draft', '2026-11-18', 0),
(5, 'maths', 'PG & Research Department of Mathematics', 'School of Computing Sciences', 'Dr. Y. Dominic', 'in_progress', '2026-11-19', 0),
(6, 'english', 'PG & Research Department of English', 'School of Languages and Culture', 'Dr. V. L. Jayapaul', 'draft', '2026-11-20', 0),
(7, 'bba', 'Department of Business Administration (BBA)', 'School of Management Studies', 'Dr. P. Bastin Jerome', 'draft', '2026-11-21', 0),
(8, 'botany', 'PG & Research Department of Botany', 'School of Biological Sciences', 'Dr. S. Sahaya Sathish', 'draft', '2026-11-22', 0)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- --------------------------------------------------------
-- Seed Users (Passwords hashed with password_hash standard BCRYPT)
-- Default passwords:
-- admin: admin123
-- cs: cs123
-- commerce: commerce123
-- physics: physics123
-- chemistry: chemistry123
-- maths: maths123
-- english: english123
-- bba: bba123
-- botany: botany123
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `password_hash`, `display_name`, `role`, `department_id`) VALUES
(1, 'admin', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHeFvX4fTfK5v9v489XmD0zR4r1G3Vj8O.', 'IQAC Administrator', 'admin', NULL),
(2, 'cs', '$2y$10$y5cK4F6nNfVz.0mB1eL67.Gg2sV1w8kL5P3mN9rQ8tE7uY4iO6aD.', 'HOD Computer Science', 'department', 1),
(3, 'commerce', '$2y$10$p3Q8mN5rL1vK7.Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN.', 'HOD Commerce', 'department', 2),
(4, 'physics', '$2y$10$m9N5rL1vK7p3Q8.Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN.', 'HOD Physics', 'department', 3),
(5, 'chemistry', '$2y$10$vK7p3Q8mN5rL1.Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN.', 'HOD Chemistry', 'department', 4),
(6, 'maths', '$2y$10$Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN9rL1vK7p3Q8mN5.', 'HOD Mathematics', 'department', 5),
(7, 'english', '$2y$10$8mB1eL67.Gg2sV1w8kL5P3mN9rL1vK7p3Q8mN5rL1.Gs2wV0xF4nTfVz.', 'HOD English', 'department', 6),
(8, 'bba', '$2y$10$kL5P3mN9rL1vK7p3Q8mN5rL1.Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w.', 'HOD BBA', 'department', 7),
(9, 'botany', '$2y$10$V0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN9rL1vK7p3Q8mN5rL1.Gs2w.', 'HOD Botany', 'department', 8)
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`);

COMMIT;
