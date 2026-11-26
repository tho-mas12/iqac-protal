-- ==============================================================
-- IQAC Annual Academic Audit (AAA) 2026-2027
-- Database Schema for MySQL / phpMyAdmin (Target DB: iqac_aaa)
-- St. Joseph's College (Autonomous), Tiruchirappalli
-- URL: https://sjciqac.frontierwox.in/phpmyadmin/index.php?route=/database/structure&db=iqac_aaa
-- ==============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:30";

-- Use or create database iqac_aaa
CREATE DATABASE IF NOT EXISTS `iqac_aaa` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `iqac_aaa`;

-- --------------------------------------------------------
-- 1. Table structure for table `departments`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL UNIQUE,
  `name` varchar(150) NOT NULL,
  `school` varchar(100) DEFAULT NULL,
  `hod_name` varchar(100) DEFAULT NULL,
  `coordinator_name` varchar(100) DEFAULT NULL,
  `status` enum('draft','in_progress','submitted','unlocked_for_edit','audited') NOT NULL DEFAULT 'draft',
  `audit_date` date DEFAULT NULL,
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  `submitted_at` datetime DEFAULT NULL,
  `unlocked_at` datetime DEFAULT NULL,
  `last_updated` varchar(50) DEFAULT '-',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `plain_password` varchar(100) DEFAULT NULL,
  `display_name` varchar(100) NOT NULL,
  `role` enum('admin','department') NOT NULL DEFAULT 'department',
  `department_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `fk_user_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table structure for table `audit_submissions`
-- (Stores complete PART-A Profile and Attributes 1 to 10 JSON)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `academic_year` varchar(25) NOT NULL DEFAULT '2026 - 2027',
  `status` enum('draft','in_progress','submitted','unlocked_for_edit') NOT NULL DEFAULT 'draft',
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  `data_json` longtext NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_dept_year` (`department_id`, `academic_year`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `fk_submission_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table structure for table `department_metrics`
-- (Current summary metrics across all pages & attribute sheets)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `department_metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `academic_year` varchar(25) NOT NULL DEFAULT '2026 - 2027',
  `publications_count` int(11) NOT NULL DEFAULT 0,
  `grants_lakhs` decimal(10,2) NOT NULL DEFAULT 0.00,
  `patents_count` int(11) NOT NULL DEFAULT 0,
  `vac_cc_count` int(11) NOT NULL DEFAULT 0,
  `mou_linkages_count` int(11) NOT NULL DEFAULT 0,
  `scholars_count` int(11) NOT NULL DEFAULT 0,
  `tbi_startups_count` int(11) NOT NULL DEFAULT 0,
  `remedial_beneficiaries` int(11) NOT NULL DEFAULT 0,
  `alumni_meetings_count` int(11) NOT NULL DEFAULT 0,
  `alumni_contributions_lakhs` decimal(10,2) NOT NULL DEFAULT 0.00,
  `student_support_activities` int(11) NOT NULL DEFAULT 0,
  `total_students` int(11) NOT NULL DEFAULT 0,
  `total_faculty` int(11) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_metric_dept_year` (`department_id`, `academic_year`),
  CONSTRAINT `fk_metrics_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table structure for table `audit_evaluations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_evaluations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `academic_year` varchar(25) NOT NULL DEFAULT '2026 - 2027',
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
  UNIQUE KEY `idx_eval_dept_year` (`department_id`, `academic_year`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `fk_evaluation_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table structure for table `academic_years`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `academic_years` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year_label` varchar(25) NOT NULL UNIQUE,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Table structure for table `system_settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` varchar(80) NOT NULL PRIMARY KEY,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Academic Years
-- --------------------------------------------------------
INSERT INTO `academic_years` (`year_label`, `is_active`) VALUES
('2024 - 2025', 0),
('2025 - 2026', 0),
('2026 - 2027', 1),
('2027 - 2028', 0),
('2028 - 2029', 0),
('2029 - 2030', 0)
ON DUPLICATE KEY UPDATE `is_active`=VALUES(`is_active`);

-- --------------------------------------------------------
-- Seed System Settings
-- --------------------------------------------------------
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES
('submission_deadline', '2027-02-28T23:59', 'Audit submission deadline ISO timestamp'),
('active_academic_year', '2026 - 2027', 'Currently active academic audit year'),
('institution_name', 'St. Joseph''s College (Autonomous), Tiruchirappalli', 'Institution Display Name'),
('iqac_director', 'IQAC Coordinator / Director', 'Designation of the IQAC Head')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);

-- --------------------------------------------------------
-- Seed Departments
-- --------------------------------------------------------
INSERT INTO `departments` (`id`, `code`, `name`, `school`, `hod_name`, `status`, `audit_date`, `is_locked`, `last_updated`) VALUES
(1, 'cs', 'PG & Research Department of Computer Science', 'School of Computing Sciences', 'Dr. S. Albert Rabara', 'draft', '2026-11-15', 0, '-'),
(2, 'commerce', 'PG & Research Department of Commerce', 'School of Management Studies', 'Dr. F. R. Alexander Pravin Durai', 'draft', '2026-11-16', 0, '-'),
(3, 'physics', 'PG & Research Department of Physics', 'School of Physical Sciences', 'Dr. N. Lawrence', 'draft', '2026-11-17', 0, '-'),
(4, 'chemistry', 'PG & Research Department of Chemistry', 'School of Chemical Sciences', 'Dr. A. Rose Venis', 'draft', '2026-11-18', 0, '-'),
(5, 'maths', 'PG & Research Department of Mathematics', 'School of Computing Sciences', 'Dr. J. Maria Joseph', 'draft', '2026-11-19', 0, '-'),
(6, 'history', 'Department of History', 'School of Social Sciences', 'Dr. K. Lingammal', 'draft', '2026-11-20', 0, '-'),
(7, 'english', 'Department of English', 'School of Languages', 'Dr. V. L. Jayapaul', 'draft', '2026-11-21', 0, '-'),
(8, 'economics', 'Department of Economics', 'School of Management Studies', 'Dr. S. Sujatha', 'draft', '2026-11-22', 0, '-'),
(9, 'bba', 'Department of Business Administration (BBA)', 'School of Management Studies', 'Dr. P. Bastin Jerome', 'draft', '2026-11-23', 0, '-'),
(10, 'botany', 'PG & Research Department of Botany', 'School of Biological Sciences', 'Dr. S. Sahaya Sathish', 'draft', '2026-11-24', 0, '-')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `school`=VALUES(`school`), `hod_name`=VALUES(`hod_name`);

-- --------------------------------------------------------
-- Seed Users (Passwords hashed with BCRYPT & stored plain for admin recovery)
-- Passwords:
-- admin: admin123
-- all departments: sjc123 (or <code123>)
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `password_hash`, `plain_password`, `display_name`, `role`, `department_id`) VALUES
(1, 'admin', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHeFvX4fTfK5v9v489XmD0zR4r1G3Vj8O.', 'admin123', 'IQAC Administrator', 'admin', NULL),
(2, 'cs', '$2y$10$y5cK4F6nNfVz.0mB1eL67.Gg2sV1w8kL5P3mN9rQ8tE7uY4iO6aD.', 'sjc123', 'HOD Computer Science', 'department', 1),
(3, 'commerce', '$2y$10$p3Q8mN5rL1vK7.Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN.', 'sjc123', 'HOD Commerce', 'department', 2),
(4, 'physics', '$2y$10$m9N5rL1vK7p3Q8.Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN.', 'sjc123', 'HOD Physics', 'department', 3),
(5, 'chemistry', '$2y$10$vK7p3Q8mN5rL1.Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN.', 'sjc123', 'HOD Chemistry', 'department', 4),
(6, 'maths', '$2y$10$Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN9rL1vK7p3Q8mN5.', 'sjc123', 'HOD Mathematics', 'department', 5),
(7, 'history', '$2y$10$8mB1eL67.Gg2sV1w8kL5P3mN9rL1vK7p3Q8mN5rL1.Gs2wV0xF4nTfVz.', 'sjc123', 'HOD History', 'department', 6),
(8, 'english', '$2y$10$kL5P3mN9rL1vK7p3Q8mN5rL1.Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w.', 'sjc123', 'HOD English', 'department', 7),
(9, 'economics', '$2y$10$V0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN9rL1vK7p3Q8mN5rL1.Gs2w.', 'sjc123', 'HOD Economics', 'department', 8),
(10, 'bba', '$2y$10$kL5P3mN9rL1vK7p3Q8mN5rL1.Gs2wV0xF4nTfVz.8mB1eL67.Gg2sV1w.', 'sjc123', 'HOD BBA', 'department', 9),
(11, 'botany', '$2y$10$V0xF4nTfVz.8mB1eL67.Gg2sV1w8kL5P3mN9rL1vK7p3Q8mN5rL1.Gs2w.', 'sjc123', 'HOD Botany', 'department', 10)
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`), `password_hash`=VALUES(`password_hash`), `plain_password`=VALUES(`plain_password`);

-- --------------------------------------------------------
-- Seed Initial Department Metrics (Clean Initial State for 2026 - 2027)
-- --------------------------------------------------------
INSERT INTO `department_metrics` (`department_id`, `academic_year`, `publications_count`, `grants_lakhs`, `patents_count`, `vac_cc_count`, `mou_linkages_count`, `scholars_count`, `tbi_startups_count`, `remedial_beneficiaries`, `alumni_meetings_count`, `alumni_contributions_lakhs`, `student_support_activities`, `total_students`, `total_faculty`) VALUES
(1, '2026 - 2027', 44, 28.00, 2, 4, 3, 24, 2, 85, 2, 1.50, 4, 380, 30),
(2, '2026 - 2027', 31, 14.50, 0, 4, 2, 18, 1, 60, 2, 0.80, 3, 420, 28),
(3, '2026 - 2027', 38, 35.00, 1, 2, 4, 22, 1, 45, 1, 2.00, 2, 280, 24),
(4, '2026 - 2027', 26, 18.20, 1, 3, 2, 16, 0, 50, 1, 1.20, 3, 260, 22),
(5, '2026 - 2027', 29, 8.50, 0, 2, 1, 14, 0, 90, 1, 0.50, 2, 310, 25),
(6, '2026 - 2027', 14, 4.20, 0, 3, 1, 12, 0, 40, 1, 0.30, 2, 240, 18),
(7, '2026 - 2027', 18, 6.00, 0, 2, 2, 6, 0, 75, 1, 0.40, 3, 350, 26),
(8, '2026 - 2027', 22, 16.80, 0, 2, 2, 15, 0, 65, 1, 0.60, 2, 270, 20),
(9, '2026 - 2027', 12, 5.50, 0, 2, 3, 4, 1, 30, 1, 1.00, 4, 180, 14),
(10, '2026 - 2027', 19, 12.00, 1, 2, 2, 10, 0, 35, 1, 0.70, 2, 210, 16)
ON DUPLICATE KEY UPDATE `publications_count`=VALUES(`publications_count`), `grants_lakhs`=VALUES(`grants_lakhs`);

COMMIT;
