-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 11, 2026 at 12:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `research_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `published_by` int(11) NOT NULL,
  `published_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `status` enum('active','archived') DEFAULT 'active',
  `file_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `published_by`, `published_at`, `updated_at`, `status`, `file_path`) VALUES
(7, 'hi', 'hello', 1, '2025-12-08 19:55:43', '2025-12-08 20:04:48', 'active', 'uploads/announcements/1765195488_Y2k Sticker sheet.jpg'),
(8, 'gumagana ba', 'sana', 1, '2025-12-17 06:19:48', NULL, 'active', 'uploads/announcements/1765923588_proposal_16_1765711123.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `boardapprovals`
--

CREATE TABLE `boardapprovals` (
  `approval_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `approval_date` date DEFAULT NULL,
  `status` enum('PENDING','APPROVED','DECLINED') DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `colleges`
--

CREATE TABLE `colleges` (
  `college_id` int(11) NOT NULL,
  `college_name` varchar(255) DEFAULT NULL,
  `college_code` varchar(50) DEFAULT NULL,
  `college_logo` varchar(255) DEFAULT NULL,
  `college_dean` varchar(255) DEFAULT NULL,
  `campus` enum('MAIN','LAOANG','CATUBIG') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `colleges`
--

INSERT INTO `colleges` (`college_id`, `college_name`, `college_code`, `college_logo`, `college_dean`, `campus`, `is_active`, `created_at`) VALUES
(1, 'College of Science', 'CS', 'http://localhost/URDS_Project/URDS/public/img/cs.jpg', NULL, 'MAIN', 1, '2025-11-17 03:56:58'),
(2, 'College of Business Administration', 'CBA', 'http://localhost/URDS_Project/URDS/public/img/cba.jpg', NULL, 'MAIN', 1, '2025-11-17 03:56:58'),
(3, 'College of Agriculture, Fisheries and Natural Resources', 'CAFNR', 'http://localhost/URDS_Project/URDS/public/img/cafnr.jpg', NULL, 'MAIN', 1, '2025-11-17 03:56:58'),
(4, 'College of Arts and Communication', 'CAC', 'http://localhost/URDS_Project/URDS/public/img/cac.jpg', NULL, 'MAIN', 1, '2025-11-17 03:56:58'),
(5, 'College of Criminal Justice', 'CCJ', 'http://localhost/URDS_Project/URDS/public/img/ccj.jpg', NULL, 'MAIN', 1, '2025-11-17 03:56:58'),
(6, 'College of Veterinary Medicine', 'CVM', 'http://localhost/URDS_Project/URDS/public/img/cvm.png', NULL, 'MAIN', 1, '2025-11-17 03:56:58'),
(7, 'College of Engineering', 'COE', 'http://localhost/URDS_Project/URDS/public/img/coe.png', NULL, 'MAIN', 1, '2025-11-17 03:56:58'),
(8, 'College of Graduate Studies', 'GS', 'http://localhost/URDS_Project/URDS/public/img/logo.jpg', NULL, 'MAIN', 1, '2025-11-17 03:56:58'),
(9, 'College of Law', 'CL', 'http://localhost/URDS_Project/URDS/public/img/cl.png', NULL, 'MAIN', 1, '2025-11-17 03:56:58'),
(10, 'College of Nursing and Allied Health Sciences', 'CNAHS', 'http://localhost/URDS_Project/URDS/public/img/cnahs.jpg', NULL, 'MAIN', 1, '2025-11-17 03:56:58'),
(11, 'College of Education', 'COED', 'http://localhost/URDS_Project/URDS/public/img/coed.jpg', 'Dr. TITO M. CABILI', 'MAIN', 1, '2025-11-17 03:56:58');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `department_code` varchar(50) DEFAULT NULL,
  `college_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `department_name`, `department_code`, `college_id`, `is_active`, `created_at`) VALUES
(1, 'Biology Department', NULL, 1, 1, '2025-12-08 11:42:45'),
(2, 'Chemistry Department', NULL, 1, 1, '2025-12-08 11:42:45'),
(3, 'Mathematics Department', NULL, 1, 1, '2025-12-08 11:42:45'),
(4, 'IT Department', NULL, 1, 1, '2025-12-08 11:42:45'),
(5, 'Environmental Sciences Department', NULL, 1, 1, '2025-12-08 11:42:45'),
(6, 'Accountancy Department', NULL, 2, 1, '2025-12-08 11:43:02'),
(7, 'Entrepreneurship Department', NULL, 2, 1, '2025-12-08 11:43:02'),
(8, 'Hospitality Management Department', NULL, 2, 1, '2025-12-08 11:43:02'),
(9, 'Marketing Department', NULL, 2, 1, '2025-12-08 11:43:02'),
(10, 'Cooperative Management Department', NULL, 2, 1, '2025-12-08 11:43:02'),
(11, 'Elementary Education Department', NULL, 11, 1, '2025-12-08 11:43:19'),
(12, 'Secondary Education Department', NULL, 11, 1, '2025-12-08 11:43:19'),
(13, 'Physical Education Department', NULL, 11, 1, '2025-12-08 11:43:19'),
(14, 'Agriculture Department', NULL, 3, 1, '2025-12-08 11:43:39'),
(15, 'Forestry Department', NULL, 3, 1, '2025-12-08 11:43:39'),
(16, 'Fisheries Department', NULL, 3, 1, '2025-12-08 11:43:39'),
(17, 'Agri-Business Department', NULL, 3, 1, '2025-12-08 11:43:39'),
(18, 'Nursing Department', NULL, 10, 1, '2025-12-08 11:43:52'),
(19, 'Radiologic Technology Department', NULL, 10, 1, '2025-12-08 11:43:52'),
(20, 'Civil Engineering Department', NULL, 7, 1, '2025-12-08 11:43:57'),
(21, 'Electrical Engineering Department', NULL, 7, 1, '2025-12-08 11:43:57'),
(22, 'Mechanical Engineering Department', NULL, 7, 1, '2025-12-08 11:43:57'),
(23, 'Agriculture and Bioengineering Department', NULL, 7, 1, '2025-12-08 11:43:57'),
(24, 'Automotive Engineering Department', NULL, 7, 1, '2025-12-08 11:43:57'),
(25, 'Humanities Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(26, 'Social Sciences Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(27, 'Natural Sciences Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(28, 'Engineering & Technology Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(29, 'Business & Management Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(30, 'Health Sciences Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(31, 'Law & Policy Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(32, 'Arts & Design Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(33, 'Education Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(34, 'Interdisciplinary Studies Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(35, 'Communication & Media Studies Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(36, 'Library and Information Sciences Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(37, 'Agriculture & Food Sciences Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(38, 'Languages & Linguistics Department', NULL, 8, 1, '2025-12-08 11:44:01'),
(39, 'Civil Law Department', NULL, 9, 1, '2025-12-08 11:44:06'),
(40, 'Criminal Law Department', NULL, 9, 1, '2025-12-08 11:44:06'),
(41, 'Commercial Law Department', NULL, 9, 1, '2025-12-08 11:44:06'),
(42, 'Constitutional Law Department', NULL, 9, 1, '2025-12-08 11:44:06'),
(43, 'International Law Department', NULL, 9, 1, '2025-12-08 11:44:06'),
(44, 'Labor Law & Social Legislation Department', NULL, 9, 1, '2025-12-08 11:44:06'),
(45, 'Taxation Law Department', NULL, 9, 1, '2025-12-08 11:44:06'),
(46, 'Legal Ethics & Legal Profession Department', NULL, 9, 1, '2025-12-08 11:44:06'),
(47, 'Special Laws Department', NULL, 9, 1, '2025-12-08 11:44:06'),
(48, 'Clinical Legal Education Department', NULL, 9, 1, '2025-12-08 11:44:06'),
(49, 'Veterinary Medicine Department', NULL, 6, 1, '2025-12-08 11:44:13'),
(57, 'AB Literature Department', 'AB L', 4, 1, '2025-12-12 09:10:34'),
(58, 'Advertising Department', 'ADVE', 4, 1, '2025-12-12 09:10:34'),
(59, 'Community Development Department', 'COMM', 4, 1, '2025-12-12 09:10:34'),
(60, 'Development Communication Department', 'DEVE', 4, 1, '2025-12-12 09:10:34'),
(61, 'Political Science Department', 'POLI', 4, 1, '2025-12-12 09:10:34'),
(62, 'Public Administration Department', 'PUBL', 4, 1, '2025-12-12 09:10:34'),
(63, 'Sociology Department', 'SOCI', 4, 1, '2025-12-12 09:10:34');

-- --------------------------------------------------------

--
-- Table structure for table `director_reviews`
--

CREATE TABLE `director_reviews` (
  `review_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `director_id` int(11) DEFAULT NULL,
  `director_name` varchar(255) NOT NULL,
  `director_comments` text DEFAULT NULL,
  `final_decision` enum('approve','revise','return_to_staff','reject') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluators`
--

CREATE TABLE `evaluators` (
  `evaluator_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `campus` enum('MAIN','LAOANG','CATUBIG') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inhousereviews`
--

CREATE TABLE `inhousereviews` (
  `review_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `review_type` enum('NEW_PROPOSAL','ONGOING_RESEARCH','COMPLETED_RESEARCH') DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `campus` enum('MAIN','LAOANG','CATUBIG') DEFAULT NULL,
  `status` enum('SCHEDULED','IN_PROGRESS','COMPLETED') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `monetaryincentives`
--

CREATE TABLE `monetaryincentives` (
  `incentive_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `researcher_id` int(11) NOT NULL,
  `prize_rank` enum('FIRST','SECOND','THIRD') DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `award_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposalcoresearchers`
--

CREATE TABLE `proposalcoresearchers` (
  `id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `researcher_id` int(11) NOT NULL,
  `role` enum('CO_RESEARCHER','ASSISTANT') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposalevaluations`
--

CREATE TABLE `proposalevaluations` (
  `evaluation_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `evaluator_id` int(11) NOT NULL,
  `review_id` int(11) DEFAULT NULL,
  `numerical_rating` decimal(4,2) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `recommendation` enum('APPROVE_FUNDING','CONTINUE','TERMINATE','AWARD_PRIZE') DEFAULT NULL,
  `prize_rank` enum('FIRST','SECOND','THIRD') DEFAULT NULL,
  `evaluation_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposalversions`
--

CREATE TABLE `proposalversions` (
  `version_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `version_number` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `abstract` text DEFAULT NULL,
  `document_path` varchar(500) DEFAULT NULL,
  `submission_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposal_equipment`
--

CREATE TABLE `proposal_equipment` (
  `id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `date_field` varchar(255) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `item_description` varchar(255) DEFAULT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `qty` decimal(12,2) DEFAULT NULL,
  `estimated_cost` decimal(12,2) DEFAULT NULL,
  `year1` decimal(12,2) DEFAULT 0.00,
  `year2` decimal(12,2) DEFAULT 0.00,
  `year3` decimal(12,2) DEFAULT 0.00,
  `total` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proposal_equipment`
--

INSERT INTO `proposal_equipment` (`id`, `proposal_id`, `date_field`, `unit`, `item_description`, `purpose`, `qty`, `estimated_cost`, `year1`, `year2`, `year3`, `total`) VALUES
(1, 19, NULL, NULL, 'rttyu', NULL, 1.00, 45.00, 45.00, 0.00, 0.00, 45.00),
(2, 28, '', '', '', '', 0.00, 34.00, 0.00, 34.00, 34.00, 0.00),
(3, 28, '', '', '', '', 0.00, 0.00, 0.00, 50.00, 0.00, 0.00),
(4, 29, '12/25/2025', 'TFY', 'TUYFGIU', 'TUYFIGU', 56.00, 29.00, 678.00, 27.00, 28.00, 0.00),
(5, 30, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(6, 31, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(7, 32, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(8, 33, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(9, 34, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(10, 35, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(11, 36, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(12, 37, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(13, 38, '', '', '', '', 0.00, 0.00, 0.00, 2000.00, 0.00, 0.00),
(14, 39, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(15, 40, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(16, 41, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(17, 42, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(18, 43, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(19, 44, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(20, 45, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(21, 46, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(22, 47, '', '', '', '', 0.00, 0.00, 0.00, 500.00, 190.00, 690.00),
(23, 48, '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `proposal_hierarchy`
--

CREATE TABLE `proposal_hierarchy` (
  `hierarchy_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `study_name` varchar(255) NOT NULL,
  `project_order` int(11) NOT NULL DEFAULT 1,
  `study_order` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `proposal_hierarchy`
--

INSERT INTO `proposal_hierarchy` (`hierarchy_id`, `proposal_id`, `project_name`, `study_name`, `project_order`, `study_order`, `created_at`) VALUES
(1, 41, 'qweredrfth', 'sample study', 1, 1, '2026-03-16 03:56:25'),
(2, 41, 'qweredrfth', 'gvhb', 1, 2, '2026-03-16 03:56:25'),
(3, 41, 'qweredrfth', 'SUPER SAMPLE', 1, 3, '2026-03-16 03:56:25'),
(4, 41, 'qweredrfth', 'SAMPLE', 1, 4, '2026-03-16 03:56:25'),
(5, 42, 'Project 1', 'sana maging detailed', 1, 1, '2026-03-16 06:55:08'),
(6, 43, 'Project 1', 'a', 1, 1, '2026-03-16 07:03:49'),
(7, 44, 'Revised', 'a', 1, 1, '2026-03-16 07:06:32'),
(8, 44, 'Revised', 'sana maging detailed', 1, 2, '2026-03-16 07:06:32'),
(9, 44, 'Revised', 'sample study', 1, 3, '2026-03-16 07:06:32'),
(10, 44, 'Revised', 'gvhb', 1, 4, '2026-03-16 07:06:32'),
(11, 44, 'Revised', 'SUPER SAMPLE', 1, 5, '2026-03-16 07:06:32'),
(12, 44, 'Revised', 'SAMPLE', 1, 6, '2026-03-16 07:06:32'),
(13, 45, 'Project 1', 'Disaster Preparedness and Emergency Response among Household in Brgy. San Agustin, Mondragon, Northern Samar', 1, 1, '2026-04-16 02:47:15'),
(14, 46, 'Project 1', 'Disaster Preparedness and Emergency Response among Household in Brgy. San Agustin, Mondragon, Northern Samar', 1, 1, '2026-04-16 02:57:32'),
(15, 47, NULL, 'a', 0, 1, '2026-05-02 17:03:59'),
(16, 47, NULL, 'Disaster Preparedness and Emergency Response among Household in Brgy. San Agustin, Mondragon, Northern Samar', 0, 2, '2026-05-02 17:03:59'),
(17, 48, NULL, 'sdjwih', 1, 1, '2026-05-04 05:51:04');

-- --------------------------------------------------------

--
-- Table structure for table `proposal_history`
--

CREATE TABLE `proposal_history` (
  `history_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` varchar(100) NOT NULL,
  `action` varchar(255) NOT NULL,
  `comment` text DEFAULT NULL,
  `checklist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`checklist`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proposal_history`
--

INSERT INTO `proposal_history` (`history_id`, `proposal_id`, `user_id`, `role`, `action`, `comment`, `checklist`, `created_at`) VALUES
(1, 19, 3, 'College Research Coordinator', 'Forwarded to Dean', 'yes', '{\"formatOk\":true,\"completenessOk\":true,\"agendaOk\":true}', '2025-12-16 13:44:58'),
(2, 19, 2, 'College Dean', 'Endorsed to URDS', 'okay', NULL, '2025-12-16 13:46:03'),
(3, 27, 17, 'College Research Coordinator', 'Returned by Coordinator', 'bawal', '{\"formatOk\":false,\"completenessOk\":false,\"agendaOk\":false}', '2025-12-16 15:20:03'),
(4, 26, 17, 'College Research Coordinator', 'Forwarded to Dean', 'ok', '{\"formatOk\":true,\"completenessOk\":true,\"agendaOk\":true}', '2025-12-16 15:20:12'),
(5, 26, 25, 'College Dean', 'Endorsed to URDS', 'yes galing', NULL, '2025-12-16 15:29:59'),
(6, 26, 6, 'URDS Staff', '', 'oki', '[]', '2025-12-16 19:02:20'),
(7, 19, 6, 'URDS Staff', '', 'sure', '[]', '2025-12-16 19:02:39'),
(8, 26, 6, 'URDS Staff', '', '', '[]', '2025-12-16 19:14:41'),
(9, 19, 7, 'Senior Faculty Researcher / TWG', 'For Director Review', 'magaling', '{\"relevance\":2,\"technical\":4,\"feasibility\":1,\"capability\":4,\"ethics\":3}', '2025-12-16 20:24:13'),
(10, 19, 7, 'Senior Faculty Researcher / TWG', 'Submitted Technical Review', 'magaling', NULL, '2025-12-16 20:24:13'),
(11, 19, 7, 'Senior Faculty Researcher / TWG', 'For Director Review', 'magaling', '{\"relevance\":2,\"technical\":4,\"feasibility\":1,\"capability\":4,\"ethics\":3}', '2025-12-16 20:24:23'),
(12, 19, 7, 'Senior Faculty Researcher / TWG', 'Submitted Technical Review', 'magaling', NULL, '2025-12-16 20:24:23'),
(13, 19, 7, 'Senior Faculty Researcher / TWG', 'For Director Review', 'magaling', '{\"relevance\":2,\"technical\":4,\"feasibility\":1,\"capability\":4,\"ethics\":3}', '2025-12-16 20:24:58'),
(14, 19, 7, 'Senior Faculty Researcher / TWG', 'Submitted Technical Review', 'magaling', NULL, '2025-12-16 20:24:58'),
(15, 19, 7, 'Senior Faculty Researcher / TWG', 'For Director Review', 'sure', '{\"relevance\":3,\"technical\":5,\"feasibility\":2,\"capability\":5,\"ethics\":5}', '2025-12-16 20:25:41'),
(16, 19, 7, 'Senior Faculty Researcher / TWG', 'Submitted Technical Review', 'sure', NULL, '2025-12-16 20:25:41'),
(17, 19, 7, 'Senior Faculty Researcher / TWG', 'For Director Review', 'sure', '{\"relevance\":5,\"technical\":5,\"feasibility\":2,\"capability\":4,\"ethics\":5}', '2025-12-16 20:29:00'),
(18, 19, 7, 'Senior Faculty Researcher / TWG', 'For Director Review', 'sure', '{\"relevance\":5,\"technical\":5,\"feasibility\":2,\"capability\":4,\"ethics\":5}', '2025-12-16 20:30:48'),
(19, 26, 8, 'UREC', 'for director review', 'wow perfect', '[]', '2025-12-16 22:06:11'),
(20, 26, 8, 'UREC', 'for director review', 'ok n ini', '{\"riskLevel\":\"Low\",\"participants\":\"Human Participants\",\"privacy\":\"Compliant\"}', '2025-12-16 22:10:33'),
(21, 26, 1, 'Director', 'Approved', 'very good ka', NULL, '2025-12-16 23:01:13'),
(22, 19, 1, 'Director', 'Approved', 'go laban', NULL, '2025-12-16 23:17:38'),
(23, 26, 1, 'Director', 'Approved', 'yezz', NULL, '2025-12-16 23:18:30'),
(24, 26, 1, 'Director', 'Approved', 'go nak', NULL, '2025-12-16 23:20:26'),
(25, 26, 1, 'URDS Director', 'Approved', 'yun oh', NULL, '2025-12-16 23:28:39'),
(26, 36, 17, 'College Research Coordinator', 'Forwarded to Dean', '', '{\"formatOk\":true,\"completenessOk\":true,\"agendaOk\":true}', '2025-12-17 02:28:33'),
(27, 36, 25, 'College Dean', 'Endorsed to URDS', 'okay na to', NULL, '2025-12-17 02:30:12'),
(28, 36, 6, 'URDS Staff', '', '', '[]', '2025-12-17 02:33:32'),
(29, 36, 8, 'UREC', 'for director review', '', '{\"riskLevel\":\"Medium\",\"participants\":\"Human Participants\",\"privacy\":\"Compliant\"}', '2025-12-17 02:36:51'),
(30, 37, 17, 'College Research Coordinator', 'Forwarded to Dean', 'good', '{\"formatOk\":true,\"completenessOk\":true,\"agendaOk\":false}', '2025-12-17 04:47:08'),
(31, 37, 25, 'College Dean', 'Endorsed to URDS', 'goodd', NULL, '2025-12-17 04:55:17'),
(32, 37, 6, 'URDS Staff', '', '.', '[]', '2025-12-17 05:09:56'),
(33, 37, 7, 'Senior Faculty Researcher / TWG', 'For Director Review', 'yes', '{\"relevance\":3,\"technical\":5,\"feasibility\":1,\"capability\":4,\"ethics\":2}', '2025-12-17 05:17:53'),
(34, 36, 17, 'College Research Coordinator', 'Forwarded to Dean', 'good', '{\"formatOk\":true,\"completenessOk\":true,\"agendaOk\":false}', '2025-12-18 10:38:08'),
(35, 36, 25, 'College Dean', 'Endorsed to URDS', 'nice', NULL, '2025-12-18 10:38:47'),
(36, 40, 3, 'College Research Coordinator', 'Forwarded to Dean', 'fine', '{\"formatOk\":true,\"completenessOk\":true,\"agendaOk\":true}', '2026-03-14 07:04:19'),
(37, 40, 2, 'College Dean', 'Endorsed to URDS', 'yes', NULL, '2026-03-14 07:04:45'),
(38, 45, 3, 'College Research Coordinator', 'Returned by Coordinator', '', '{\"formatOk\":false,\"completenessOk\":false,\"agendaOk\":false}', '2026-04-16 02:53:17'),
(39, 46, 3, 'College Research Coordinator', 'Forwarded to Dean', '', '{\"formatOk\":true,\"completenessOk\":true,\"agendaOk\":false}', '2026-04-16 02:58:43'),
(40, 46, 2, 'College Dean', 'Endorsed to URDS', 'ok', NULL, '2026-04-16 02:59:24'),
(41, 47, 3, 'College Research Coordinator', 'Forwarded to Dean', 'ok na to', '{\"formatOk\":true,\"completenessOk\":true,\"agendaOk\":false}', '2026-05-02 17:52:47'),
(42, 47, 2, 'College Dean', 'Endorsed to URDS', 'tama naaa', NULL, '2026-05-02 18:37:35');

-- --------------------------------------------------------

--
-- Table structure for table `proposal_mooe`
--

CREATE TABLE `proposal_mooe` (
  `id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `type` enum('TRAVEL','SUPPLIES','COMMUNICATIONS','OTHER') NOT NULL,
  `date_field` varchar(255) DEFAULT NULL,
  `places` varchar(255) DEFAULT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `mode_of_transport` varchar(255) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `qty` decimal(12,2) DEFAULT NULL,
  `unit_cost` decimal(12,2) DEFAULT NULL,
  `estimated_cost` decimal(12,2) DEFAULT NULL,
  `year1` decimal(12,2) DEFAULT 0.00,
  `year2` decimal(12,2) DEFAULT 0.00,
  `year3` decimal(12,2) DEFAULT 0.00,
  `total` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proposal_mooe`
--

INSERT INTO `proposal_mooe` (`id`, `proposal_id`, `type`, `date_field`, `places`, `purpose`, `mode_of_transport`, `unit`, `description`, `qty`, `unit_cost`, `estimated_cost`, `year1`, `year2`, `year3`, `total`) VALUES
(1, 19, '', NULL, NULL, NULL, NULL, NULL, '0', 3.00, 345.00, NULL, 1035.00, 0.00, 0.00, 1035.00),
(2, 19, '', NULL, NULL, NULL, NULL, NULL, '0', 1.00, 456.00, NULL, 456.00, 0.00, 0.00, 456.00),
(3, 20, 'TRAVEL', '12/02/2002', '', '', '', '', '', 0.00, 0.00, 678.00, 0.00, 45.00, 5.00, 728.00),
(4, 21, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(5, 22, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(6, 23, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(7, 24, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(8, 25, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(9, 26, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(10, 27, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(11, 28, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 77.00, 88.00, 99.00, 0.00),
(12, 28, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(13, 28, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 100.00, 110.00, 120.00, 0.00),
(14, 28, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 785.00, 0.00),
(15, 28, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 130.00, 140.00, 150.00, 0.00),
(16, 28, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 160.00, 170.00, 180.00, 0.00),
(17, 28, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 190.00, 200.00, 210.00, 0.00),
(18, 28, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 78.00, 0.00, 0.00),
(19, 29, 'TRAVEL', '12/25/2025', 'ABC', 'RDT', 'RTDYTF', '', '', 0.00, 0.00, 788.00, 15.00, 16.00, 17.00, 0.00),
(20, 29, 'SUPPLIES', '12/25/2025', '', 'WEFRG', '', 'DAW', 'SDFGH', 2345.00, 45.00, 0.00, 18.00, 19.00, 20.00, 0.00),
(21, 29, 'COMMUNICATIONS', '12/25/2025V', '', 'WERT', '', '', 'ERTY', 12.00, 0.00, 345.00, 21.00, 22.00, 23.00, 0.00),
(22, 29, '', '12/25/2025', '', 'RYTUYIUOI', '', '', 'GHUOIJ', 6.00, 0.00, 785.00, 24.00, 25.00, 26.00, 0.00),
(23, 30, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 3434.00, 34.00, 0.00, 0.00, 0.00),
(24, 30, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(25, 30, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 45.00, 0.00, 0.00),
(26, 30, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(27, 31, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 211.00, 21.00, 2.00, 0.00),
(28, 31, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 111.00, 222.00, 333.00, 0.00),
(29, 31, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(30, 31, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(31, 32, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(32, 32, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(33, 32, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(34, 32, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(35, 33, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(36, 33, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(37, 33, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(38, 33, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(39, 34, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(40, 34, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(41, 34, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(42, 34, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(43, 35, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(44, 35, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(45, 35, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(46, 35, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(47, 36, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 2000.00, 0.00, 0.00, 0.00),
(48, 36, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(49, 36, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(50, 36, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 100.00, 0.00, 0.00, 0.00),
(51, 37, 'TRAVEL', '', 'UEP', '', '', '', '', 0.00, 0.00, 0.00, 800.00, 0.00, 0.00, 0.00),
(52, 37, 'SUPPLIES', '', '', '', '', '', 'Paper', 0.00, 0.00, 0.00, 500.00, 0.00, 0.00, 0.00),
(53, 37, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(54, 37, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(55, 37, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(56, 37, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(57, 38, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(58, 38, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(59, 38, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(60, 38, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(61, 38, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(62, 38, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(63, 39, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(64, 40, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 897.00, 897.00, 0.00, 0.00),
(65, 40, 'SUPPLIES', '', '', '', '', '', '', 0.00, 787.00, 0.00, 8979.00, 0.00, 0.00, 0.00),
(66, 40, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(67, 40, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(68, 41, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 1000.00, 0.00, 0.00, 0.00),
(69, 41, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(70, 41, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(71, 41, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(72, 42, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 1100.00, 0.00, 0.00, 0.00),
(73, 42, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(74, 42, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(75, 42, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(76, 43, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(77, 43, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(78, 43, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(79, 43, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(80, 44, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(81, 44, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(82, 44, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(83, 44, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(84, 45, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(85, 45, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(86, 45, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(87, 45, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(88, 46, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(89, 46, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(90, 46, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(91, 46, '', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(92, 47, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(93, 47, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(94, 47, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, -1.00, -1.00, 0.00, 0.00, 0.00, 0.00),
(95, 47, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 789.00, 0.00, 0.00, 789.00),
(96, 47, '', '', '', '', '', 'days', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(97, 48, 'TRAVEL', 'bjb', '', '', '', '', '', 0.00, 0.00, 808.00, 0.00, 0.00, 0.00, 0.00),
(98, 48, 'TRAVEL', '', '', '', '', '', '', 0.00, 0.00, 0.00, 878.00, 0.00, 0.00, 878.00),
(99, 48, 'SUPPLIES', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(100, 48, 'COMMUNICATIONS', '', '', '', '', '', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(101, 48, '', '', '', '', '', 'days', '', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `proposal_ps`
--

CREATE TABLE `proposal_ps` (
  `id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `item` varchar(255) NOT NULL,
  `q1` decimal(12,2) DEFAULT 0.00,
  `q2` decimal(12,2) DEFAULT 0.00,
  `q3` decimal(12,2) DEFAULT 0.00,
  `q4` decimal(12,2) DEFAULT 0.00,
  `year1` decimal(12,2) DEFAULT 0.00,
  `year2` decimal(12,2) DEFAULT 0.00,
  `year3` decimal(12,2) DEFAULT 0.00,
  `total` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proposal_ps`
--

INSERT INTO `proposal_ps` (`id`, `proposal_id`, `item`, `q1`, `q2`, `q3`, `q4`, `year1`, `year2`, `year3`, `total`) VALUES
(1, 19, 'srdytfyjgu', 0.00, 0.00, 0.00, 0.00, 3456.00, 0.00, 0.00, 3456.00),
(2, 20, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(3, 20, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(4, 21, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(5, 21, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(6, 22, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(7, 22, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(8, 23, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(9, 23, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(10, 24, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(11, 24, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(12, 25, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(13, 25, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(14, 26, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(15, 26, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(16, 27, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(17, 27, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(18, 28, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 11.00, 22.00, 33.00, 0.00),
(19, 28, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 44.00, 55.00, 66.00, 0.00),
(20, 29, 'A. Wages', 1.00, 2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 0.00),
(21, 29, 'B. Honorarium', 8.00, 9.00, 10.00, 11.00, 12.00, 13.00, 14.00, 0.00),
(22, 30, 'A. Wages', 0.00, 0.00, 0.00, 13.00, 34.00, 0.00, 0.00, 0.00),
(23, 30, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(24, 31, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 12.00, 122.00, 1222.00, 0.00),
(25, 31, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(26, 32, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 454.00, 0.00, 0.00, 0.00),
(27, 32, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(28, 33, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(29, 33, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(30, 34, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(31, 34, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(32, 35, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(33, 35, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(34, 36, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(35, 36, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 5000.00, 0.00, 0.00, 0.00),
(36, 37, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 2000.00, 1000.00, 200.00, 0.00),
(37, 37, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(38, 38, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 1000.00, 0.00, 0.00, 0.00),
(39, 38, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 5000.00, 0.00, 0.00, 0.00),
(40, 39, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(41, 39, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(42, 40, 'A. Wages', 0.00, 8098.00, 98.00, 8.00, 908.00, 980.00, 890.00, 0.00),
(43, 40, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(44, 41, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 200.00, 0.00, 0.00, 0.00),
(45, 41, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 800.00, 0.00, 0.00),
(46, 42, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 200.00, 0.00, 0.00, 0.00),
(47, 42, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 700.00, 0.00, 0.00, 0.00),
(48, 43, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(49, 43, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(50, 44, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(51, 44, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(52, 45, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 1000.00, 0.00, 0.00),
(53, 45, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 1000.00, 0.00, 0.00, 0.00),
(54, 46, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(55, 46, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 2000.00, 0.00, 0.00),
(56, 47, 'A. Wages', 0.00, 0.00, 0.00, 0.00, 521.00, 0.00, 0.00, 521.00),
(57, 47, 'B. Honorarium', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00),
(58, 48, 'A. Wages', 0.00, 0.00, 2331.00, 0.00, 798.00, 0.00, 0.00, 798.00),
(59, 48, 'B. Honorarium', 0.00, 0.00, 0.00, 332.00, 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `researchfunding`
--

CREATE TABLE `researchfunding` (
  `funding_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `approved_budget` decimal(15,2) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `status` enum('PENDING','RELEASED','UTILIZED') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `researchproposals`
--

CREATE TABLE `researchproposals` (
  `proposal_id` int(11) NOT NULL,
  `program_title` varchar(500) NOT NULL,
  `program_description` text DEFAULT NULL,
  `nature` varchar(50) DEFAULT NULL,
  `research_cluster` varchar(100) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `college_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `study_leader` varchar(255) DEFAULT NULL,
  `other_personnel` text DEFAULT NULL,
  `project_location` varchar(255) DEFAULT NULL,
  `duration_months` int(11) DEFAULT NULL,
  `estimated_budget` decimal(15,2) DEFAULT NULL,
  `rationale` text DEFAULT NULL,
  `objectives` text DEFAULT NULL,
  `literature` text DEFAULT NULL,
  `methodology` text DEFAULT NULL,
  `expected_output` text DEFAULT NULL,
  `impact` text DEFAULT NULL,
  `proposal_file` varchar(255) DEFAULT NULL,
  `workplan_file` varchar(255) DEFAULT NULL,
  `budget_file` varchar(255) DEFAULT NULL,
  `status` enum('draft','for screening','for dean endorsement','for URDS review','for TWG evaluation','for UREC review','for director review','returned for revision','rejected','approved') NOT NULL DEFAULT 'for screening',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dean_endorsed` tinyint(1) DEFAULT 0,
  `dean_endorsed_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `researchproposals`
--

INSERT INTO `researchproposals` (`proposal_id`, `program_title`, `program_description`, `nature`, `research_cluster`, `user_id`, `college_id`, `department_id`, `study_leader`, `other_personnel`, `project_location`, `duration_months`, `estimated_budget`, `rationale`, `objectives`, `literature`, `methodology`, `expected_output`, `impact`, `proposal_file`, `workplan_file`, `budget_file`, `status`, `created_at`, `updated_at`, `dean_endorsed`, `dean_endorsed_date`) VALUES
(16, 'SAMPLE', 'Research Type: Study | Cluster: Science & Technology', 'Study', 'Science & Technology', 5, 2, 7, 'Destura', 'ASAD', 'UEP', 5, 5000.00, 'QQWERTYUIOPP', 'SDFGHJKL', 'DFCVBHGFG', 'CVBHGFGHCVNB N', 'HGHCVN BNBJHG', 'VBHGFFCB NJ', 'uploads/proposals/proposal_16_1765711123.pdf', 'uploads/proposals/workplan_16_1765711123.pdf', 'uploads/proposals/budget_16_1765711123.pdf', 'for TWG evaluation', '2025-12-14 11:18:43', '2025-12-16 20:48:37', 0, NULL),
(17, 'erstdyfu', 'Research Type: Program | Cluster: Science & Technology', 'Program', 'Science & Technology', 5, 8, 25, 'wrteyrjt', 'yrteyru', 'teyrudt', 6, 0.00, '5udytifkjhtreyru', 'tryru', 'treyrug', 'etyrut', 'eytrdud', 'artyeturyukg', 'uploads/proposals/proposal_17_1765739444.pdf', 'uploads/proposals/workplan_17_1765739444.pdf', 'uploads/proposals/budget_17_1765739444.pdf', 'for screening', '2025-12-14 19:10:44', '2025-12-14 19:10:44', 0, NULL),
(18, 'erstdyfu', 'Research Type: Program | Cluster: Science & Technology', 'Program', 'Science & Technology', 5, 8, 25, 'wrteyrjt', 'yrteyru', 'teyrudt', 6, 0.00, '5udytifkjhtreyru', 'tryru', 'treyrug', 'etyrut', 'eytrdud', 'artyeturyukg', 'uploads/proposals/proposal_18_1765739739.pdf', 'uploads/proposals/workplan_18_1765739739.pdf', 'uploads/proposals/budget_18_1765739739.pdf', 'for UREC review', '2025-12-14 19:15:39', '2025-12-16 21:52:08', 0, NULL),
(19, 'SAMPLE', 'Research Type: Study | Cluster: Science & Technology', 'Study', 'Science & Technology', 5, 2, 7, 'Destura', 'ASAD', 'UEP', 5, 0.00, 'QQWERTYUIOPP', 'SDFGHJKL', 'DFCVBHGFG', 'CVBHGFGHCVNB N', 'HGHCVN BNBJHG', 'VBHGFFCB NJ', NULL, NULL, NULL, '', '2025-12-14 19:19:21', '2025-12-16 23:17:38', 1, '2025-12-16 21:46:03'),
(20, 'waresrtdyt', 'Research Type: Program | Cluster: Social Sciences', 'Program', 'Social Sciences', 5, 4, 59, 'tyg', 'treert', 'erestdyf', 3, 0.00, 'zerdxtfcygvuh', 'yfctxdzsaesrd', 'tyugvcyfxdtzrse', 'rdtfycguhi', 'dxtfycguh', 'dzrseaesrdtxfy', NULL, NULL, NULL, 'returned for revision', '2025-12-14 21:32:21', '2025-12-16 13:39:27', 0, NULL),
(21, 'safdthf', 'safdthf', 'Project', 'Social Sciences', 1, 0, 0, 'rgthyju', 'tygj', 'yfsgdh', 45, 0.00, 'rdhj', 'drftyg', 'hudrtfygu', 'tfjykgui', NULL, NULL, NULL, NULL, NULL, 'for screening', '2025-12-15 11:15:52', '2025-12-16 15:01:10', 0, NULL),
(22, 'dfsdghfg', 'dfsdghfg', 'Program', 'Education', 1, 0, 0, 'dsfg', 'eqr', 'qerq', 3, 0.00, 'fgdhj', 'jhgfdafrgty', 'trer', 'tyrtuyytr', NULL, NULL, NULL, NULL, NULL, 'for screening', '2025-12-15 11:21:38', '2025-12-16 15:01:14', 0, NULL),
(23, 'dfesrgdthfy', 'dfesrgdthfy', 'Program', 'Education', 5, 0, 0, 'srgdthyfjc', 'esrdthxfy', 'rsdth', 34, 0.00, 'eszdrhftjcy', 'esrdtfy', 'grdthfyj', 'rthfyjghtgr', NULL, NULL, NULL, NULL, NULL, 'for screening', '2025-12-15 11:32:36', '2025-12-16 15:00:05', 0, NULL),
(24, 'aefsrgthyj', 'aefsrgthyj', 'Program', 'Social Sciences', 5, 1, 4, 'gthyju', 'yhgfdf', 'dfgdhfj', 5, 0.00, 'gbdvfsc', 'sfvdgfhj', 'nhbgdvfs', 'ghjhgf', NULL, NULL, NULL, NULL, NULL, 'for screening', '2025-12-15 12:29:26', '2025-12-16 15:19:44', 0, NULL),
(25, 'FINAL NA THIS', 'FINAL NA THIS', 'Program', 'Education', 5, 1, 4, 'CGUHI', 'DYTFUYIGUHOI', 'DTUFYIGUOHI', 678, 0.00, 'RDYHGCVJHBKJLI', 'UYTGCJVHKBJUG', 'IYFTGCVHUO', 'YIFTGCHVKGUYI', NULL, NULL, NULL, NULL, NULL, 'approved', '2025-12-15 12:56:04', '2025-12-16 23:24:43', 0, NULL),
(26, 'try', 'try', 'Program', 'Humanities', 5, 1, 4, 'afsgh', 'gsfae', 'wergdth', 45, 0.00, 'zdhxfjcgkvh', 'rzdhxtfjcygk', 'dhfjhcgvj,', 'dthfjg', NULL, NULL, NULL, NULL, NULL, 'approved', '2025-12-15 13:09:08', '2025-12-16 23:28:39', 1, '2025-12-16 23:29:59'),
(27, 'LLLLLLLLL', 'LLLLLLLLL', 'Project', 'Health & Medicine', 5, 1, 4, 'ZESRXDFCYGV', 'FCYVGHBUNJ', 'XTCYVGUBHI', 12, 0.00, 'WAESRDT', 'ETSYRDTFYGKUH', 'ERDTFYGKUH', 'RDTFYGKUHLK', NULL, NULL, NULL, NULL, NULL, 'returned for revision', '2025-12-15 13:18:15', '2025-12-16 15:20:03', 0, NULL),
(28, 'LLLLLLLLL', 'LLLLLLLLL', 'Project', NULL, 5, 1, 4, 'ZESRXDFCYGV', 'FCYVGHBUNJ', 'XTCYVGUBHI', 12, 0.00, 'WAESRDT', 'ETSYRDTFYGKUH', 'ERDTFYGKUH', 'RDTFYGKUHLK', NULL, NULL, 'uploads/proposals/proposal_28_1765903169.pdf', NULL, NULL, 'for screening', '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, NULL),
(29, 'SUPER SAMPLE', 'SUPER SAMPLE', 'Study', NULL, 5, 1, 4, 'Destura', 'ASDFGH', 'UEP', 23, 0.00, 'WALA', 'HAHA', 'UHN', 'HFEIH', NULL, NULL, 'uploads/proposals/proposal_29_1765904454.pdf', NULL, NULL, 'for screening', '2025-12-16 17:00:54', '2025-12-16 17:00:54', 0, NULL),
(30, 'HI HELLO', 'HI HELLO', 'Project', NULL, 5, 1, 4, 'AESRTD', 'SERD', 'ES', 34, 0.00, 'RESZTDRXTF', 'RDXTFCYERTFCYGV', 'RXTFCYGV', 'ERXTCY', NULL, NULL, NULL, NULL, NULL, 'for screening', '2025-12-16 17:04:12', '2025-12-16 17:33:53', 0, NULL),
(31, '123', '123', 'Project', NULL, 5, 1, 4, 'SDGFG', 'ESRZDTHXF', 'WERZ', 23, 0.00, 'ZERHXT', 'ERGXHTF', 'EZRHXTF', 'ESZGRDHXTFCH', NULL, NULL, NULL, NULL, NULL, 'for screening', '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, NULL),
(32, 'drafttt', 'drafttt', 'Project', NULL, 5, 1, 4, 'Destura', 'asdfghjk', 'uep', 234, 0.00, 'utdhfxchjfyd', 'tytf', 'rthjgvhgy', 'hgjhyf', NULL, NULL, NULL, NULL, NULL, 'draft', '2025-12-16 17:35:06', '2025-12-16 17:58:15', 0, NULL),
(33, 'qwertyui', 'qwertyui', 'Project', NULL, 5, 1, 4, 'trdyfug', 'trdyfuytyrf', 'tytdfuyrttttttttttt', 23, 0.00, 'iutyhgdxcgh', 'retrsdhgjfht', 'retrygiukhv', 'tfhgcjhyfg', NULL, NULL, NULL, NULL, NULL, 'draft', '2025-12-16 17:47:43', '2025-12-16 17:58:15', 0, NULL),
(34, 'sfg', 'sfg', 'Project', NULL, 5, 1, 4, 'fghgcjv', 'egrhtcvh', 'erghth', 56, 0.00, 'awrztesyrxdtc', 'fywestxdrctyfvjg', 'etrxtcyvguh', 'etrdthfygh', NULL, NULL, NULL, NULL, NULL, 'draft', '2025-12-16 17:56:42', '2025-12-16 17:58:15', 0, NULL),
(35, 'qweredrfth', 'qweredrfth', 'Project', NULL, 5, 1, 4, 'awsedrftc', 'erxtcygv', 'wer', 23, 0.00, 'rterxytcyfjgv', 'etzyrtcyjgvukhb', 'zteyrxtcyvg', 'etrxtcfjygv', NULL, NULL, NULL, NULL, NULL, 'draft', '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, NULL),
(36, 'Antimicrobial Activity of Selected Medicinal Plants in Northern Samar ', 'Antimicrobial Activity of Selected Medicinal Plants in Northern Samar ', 'Project', 'Health & Medicine', 33, 1, 1, 'Dr. Josephine L. Ramos ', 'Abel Flores', 'UEP Main Campus', 3, 0.00, 'Freshwater ecosystems are critical sources of potable water, food security, and biodiversity.\nHowever, increasing anthropogenic activities such as agricultural runoff, improper waste disposal,\nand urban expansion pose serious threats to water quality and microbial balance.\n\nIn Northern Samar, limited studies have been conducted to assess microbial diversity in freshwater\nsources, despite the province’s reliance on rivers and springs for domestic and agricultural use.\nUnderstanding microbial composition is essential for identifying potential pathogens and ensuring\nenvironmental sustainability.\n\nThis study aims to provide baseline biological data that can support environmental protection,\npublic health policies, and future biological research initiatives in the region.', '1. Identify mangrove species present in selected areas\n2. Determine species abundance and diversity\n3. Recommend conservation strategies', 'Freshwater ecosystems are known to harbor diverse microbial communities that play essential roles\nin nutrient cycling and ecosystem stability (Allan & Castillo, 2007). Changes in water quality\nparameters such as temperature, pH, and nutrient concentration can significantly influence microbial\npopulation structure (Wetzel, 2001).\n\nStudies by WHO (2017) emphasize that microbial contamination in freshwater sources is one of the\nleading causes of waterborne diseases in developing regions. Coliform bacteria, in particular, are\ncommonly used as indicators of fecal contamination and public health risk.\n\nIn the Philippine context, Cruz et al. (2019) documented elevated microbial loads in surface waters\nnear agricultural communities, highlighting the need for localized microbial assessments. However,\ndata on microbial diversity in Northern Samar remains limited.\n\nThis study builds upon previous findings by providing updated and location-specific microbial data,\ncontributing to environmental biology research and water resource management in the region.', 'The study will employ a descriptive and experimental research design.\nWater samples will be collected from selected rivers, springs, and wells\nacross Northern Samar using sterile containers.\n\nPhysicochemical parameters such as pH, temperature, turbidity, and dissolved oxygen\nwill be measured in situ. Microbial analysis will be conducted using standard\nculture-based techniques and microscopic examination.\n\nData will be analyzed using descriptive statistics and diversity indices to\ncompare microbial populations across locations.', NULL, NULL, NULL, NULL, NULL, 'for URDS review', '2025-12-17 02:18:50', '2025-12-18 10:38:47', 1, '2025-12-18 18:38:47'),
(37, 'Assessment of Water Quality and its Effect on Aquatic Biodiversity in Selected River Systems of Northern Samar', 'Assessment of Water Quality and its Effect on Aquatic Biodiversity in Selected River Systems of Northern Samar', 'Study', 'Science & Technology', 34, 1, 4, 'Destura', 'De Asis', 'UEP', 5, 0.00, 'Freshwater ecosystems', 'To analyze the physicochemical parameters', 'sadsf', 'tuyiu', NULL, NULL, 'uploads/proposals/proposal_37_1765946509.pdf', NULL, NULL, 'for director review', '2025-12-17 04:41:48', '2025-12-17 05:17:53', 1, '2025-12-17 12:55:17'),
(38, 'sample', 'sample', 'Program', NULL, 33, 1, 1, 'aaa', 'aaa', 'bbb', 10, 0.00, 'qw', 'wee', 'we', 'ret', NULL, NULL, NULL, NULL, NULL, 'for screening', '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, NULL),
(39, 'gvhb', 'gvhb', 'Study', NULL, 5, 1, 4, 'yguihoijop', 'iuohijop', 'ygiuhoi', 89, 678.00, 'gjvhkjhlk', 'hlj', 'vhjkjhlkj', 'hvkjhlkj', 'hvkbjhklj', 'hvkjhlkj', NULL, NULL, NULL, 'for screening', '2026-03-14 06:32:14', '2026-03-14 06:32:14', 0, NULL),
(40, 'sample study', 'sample study', 'Study', NULL, 5, 1, 4, 'qw', 'q', 'uep', 8, 12.00, 'hjkb', 'hkgjhl', 'hgkjhlk', 'jhgkh', 'gjuu', 'giuyoi', NULL, NULL, NULL, 'for URDS review', '2026-03-14 06:41:41', '2026-03-14 07:04:45', 1, '2026-03-14 15:04:45'),
(41, 'Revised', 'Revised', 'Project', NULL, 5, 1, 4, 'ZESRXDFCYGV', 'FCYVGHBUNJ', 'XTCYVGUBHI', 12, 2000.00, 'WAESRDT', 'ETSYRDTFYGKUH', 'ERDTFYGKUH', 'RDTFYGKUHLK', '', '', NULL, NULL, NULL, 'for screening', '2026-03-16 03:56:25', '2026-03-16 03:56:25', 0, NULL),
(42, 'sana maging detailed', 'sana maging detailed', 'Study', NULL, 5, 1, 4, 'ZESRXDFCYGV', 'FCYVGHBUNJ', 'XTCYVGUBHI', 12, 2000.00, 'WAESRDT', 'ETSYRDTFYGKUH', 'ERDTFYGKUH', 'RDTFYGKUHLK', 'ert', 'rgh', NULL, NULL, NULL, 'for screening', '2026-03-16 06:55:08', '2026-03-16 06:55:08', 0, NULL),
(43, 'a', 'a', 'Study', NULL, 5, 1, 4, 'd', 'as', 'as', 98, 899.00, 'tuy', 'tfuyg', 'gfj', 'fgjh', 'fgj', 'fjg', NULL, NULL, NULL, 'for screening', '2026-03-16 07:03:49', '2026-03-16 07:03:49', 0, NULL),
(44, 'revised', 'revised', 'Project', NULL, 5, 1, 4, 'ZESRXDFCYGV', 'FCYVGHBUNJ', 'XTCYVGUBHI', 12, 0.00, 'WAESRDT', 'ETSYRDTFYGKUH', 'ERDTFYGKUH', 'RDTFYGKUHLK', '', '', NULL, NULL, NULL, 'for screening', '2026-03-16 07:06:32', '2026-03-16 07:06:32', 0, NULL),
(45, 'Disaster Preparedness and Emergency Response among Household in Brgy. San Agustin, Mondragon, Northern Samar', 'Disaster Preparedness and Emergency Response among Household in Brgy. San Agustin, Mondragon, Northern Samar', 'Study', NULL, 5, 11, 11, 'Dr. Joy E. Presado', '', 'Mondragon, Northern Samar', 12, 19629.94, 'Disasters are unexpected events', 'This study will determine', 'vbijn', 'uhjshkj', 'fsdfho', 'ohuhsdf', 'uploads/proposals/proposal_45_1776307635.docx', NULL, NULL, 'returned for revision', '2026-04-16 02:47:15', '2026-04-16 02:53:17', 0, NULL),
(46, 'Disaster Preparedness and Emergency Response among Household in Brgy. San Agustin, Mondragon, Northern Samar', 'Disaster Preparedness and Emergency Response among Household in Brgy. San Agustin, Mondragon, Northern Samar', 'Study', NULL, 5, 11, 11, 'Dr. Joy E. Presado', '', 'Mondragon, Northern Samar', 12, 0.00, 'Disasters are unexpected events', 'This study will determine', 'vbijn', 'uhjshkj', 'fsdfho', 'ohuhsdf', NULL, NULL, NULL, 'for URDS review', '2026-04-16 02:57:32', '2026-04-16 02:59:24', 1, '2026-04-16 10:59:24'),
(47, 'my sample project', 'my sample project', 'Project', 'Cluster B', 5, NULL, NULL, 'Destura', 'De Asis', 'uep', 4, 2000.00, 'rdytuyviuhoi', 'cygvuhbijnokmp', 'yguhijok', 'cygvuhbinjok', 'cgvhbkjn', 'vuybiunkm', NULL, NULL, NULL, 'for URDS review', '2026-05-02 17:03:59', '2026-05-02 18:37:34', 1, '2026-05-03 02:37:34'),
(48, 'sdjwih', 'sdjwih', 'Study', 'Cluster B', 5, NULL, NULL, 'dwwd', 'dsnskldl', '', 12, 1342.00, 'wdwd', 'ekdjo', 'dekn', 'dnek', 'dedw', '', NULL, NULL, NULL, 'for screening', '2026-05-04 05:51:04', '2026-05-04 05:51:04', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `reviewpanels`
--

CREATE TABLE `reviewpanels` (
  `panel_id` int(11) NOT NULL,
  `review_id` int(11) NOT NULL,
  `evaluator_id` int(11) NOT NULL,
  `role` enum('CHAIR','MEMBER','MODERATOR') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `name` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`name`, `value`, `updated_at`) VALUES
('academicYear', '2024-2025', '2025-12-16 23:50:23'),
('semester', '1st Semester', '2025-12-16 23:50:23');

-- --------------------------------------------------------

--
-- Table structure for table `twgevaluations`
--

CREATE TABLE `twgevaluations` (
  `twg_evaluation_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `evaluator_id` int(11) NOT NULL,
  `evaluation_date` date DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `suggestions` text DEFAULT NULL,
  `status` enum('APPROVED','NEEDS_REVISION','REJECTED') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `urecreviews`
--

CREATE TABLE `urecreviews` (
  `urec_review_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `review_date` date DEFAULT NULL,
  `budget_approval` decimal(15,2) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','DECLINED') DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `role` enum('Faculty Researcher','College Research Coordinator','College Dean','URDS Director','URDS Staff','Evaluator','Senior Faculty Researcher / TWG','UREC','Administrator') NOT NULL,
  `college_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `campus` enum('MAIN','LAOANG','CATUBIG') DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `profile_picture_path` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `first_name`, `last_name`, `contact_no`, `role`, `college_id`, `department_id`, `campus`, `position`, `employee_id`, `profile_picture_path`, `is_active`, `created_at`, `approval_status`) VALUES
(0, 'sysadmin', '$2y$10$C/TCbS3RZIKsvxL.zZ7LTecbVg0iiaBF6XOqz39RVUaUg9/CBWGKa', 'admin@uep.test', 'System', 'Administrator', NULL, 'Administrator', NULL, NULL, 'MAIN', NULL, NULL, NULL, 1, '2025-11-17 02:23:59', 'approved'),
(1, 'director', '$2y$10$mAeE2ID.5HSSsVaPVtFDgO5KiyeUbmSKL4duokWuqrsrL33T4QHlq', 'director@uep.test', 'URDS', 'Director', NULL, 'URDS Director', NULL, NULL, 'MAIN', NULL, NULL, NULL, 1, '2025-11-16 13:56:44', 'approved'),
(2, 'dean', '$2y$10$0qDDUTqQLbKx6AtkMRLj8O47Rz1yxaGqYzE7Tcg/Kr4bbvBHqsJsK', 'dean@uep.test', 'College', 'Dean', NULL, 'College Dean', NULL, NULL, 'MAIN', NULL, NULL, NULL, 1, '2025-11-16 13:56:44', 'approved'),
(3, 'coordinator', '$2y$10$kYK8LuEMiz42Wnk42QwQ7eOmXkPiBiuUlHUbQwsBNgYE/ufNdxWCq', 'coordinator@uep.test', 'Research', 'Coordinator', NULL, 'College Research Coordinator', NULL, NULL, 'MAIN', NULL, NULL, NULL, 1, '2025-11-16 13:56:44', 'approved'),
(5, 'researcher', '$2y$10$JHKqb23RaPlnJgDg/KYpZ.hzxGJkQ6NfM/YUc8CUEM2wOTbCt1vvm', 'researcher@uep.test', 'Faculty', 'Researcher', NULL, 'Faculty Researcher', 1, 4, 'MAIN', NULL, NULL, NULL, 1, '2025-11-16 13:56:44', 'approved'),
(6, 'staff', '$2y$10$QifUX.GjHG.Tff22iigLyOx0oW/Ll6TwDTxnjEYz9QlRBb.2Kpqgy', 'staff@uep.test', 'URDS', 'Staff', NULL, 'URDS Staff', NULL, NULL, 'MAIN', NULL, NULL, NULL, 1, '2025-11-17 02:23:59', 'approved'),
(7, 'twg', '$2y$10$JQ3I/DUn4U2nWSAxbTm.6.fAXpnZBbyuecbAH9zMJCNp1WI.ZStwK', 'twg@uep.test', 'Senior', 'Researcher', NULL, 'Senior Faculty Researcher / TWG', NULL, NULL, 'MAIN', NULL, NULL, NULL, 1, '2025-11-17 02:23:59', 'approved'),
(8, 'urec', '$2y$10$8Ge.OVX1/JOFxK/Ku2FxBOxfug2k0Hxr6BTZSBz1.AbzS8/f5v2mi', 'urec@uep.test', 'UREC', 'Member', NULL, 'UREC', 1, NULL, 'MAIN', NULL, NULL, NULL, 1, '2025-11-17 02:23:59', 'approved'),
(17, 'cs_coord', '$2y$10$wN5.65LkjSWaAm/Zht9Pce4H1fWa4zGXi7ZyMF8oU3aPO4KFh0bTu', 'cs.coord@example.com', 'Franklin', 'Cortez', NULL, 'College Research Coordinator', 1, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:05:20', 'approved'),
(18, 'coe_coord', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'coe.coord@example.com', 'COE', 'Research Coordinator', NULL, 'College Research Coordinator', 2, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:05:20', 'approved'),
(19, 'coed_coord', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'coed.coord@example.com', 'COED', 'Research Coordinator', NULL, 'College Research Coordinator', 3, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:05:20', 'approved'),
(20, 'cba_coord', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'cba.coord@example.com', 'CBA', 'Research Coordinator', NULL, 'College Research Coordinator', 4, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:05:20', 'approved'),
(21, 'caf_coord', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'caf.coord@example.com', 'CAF', 'Research Coordinator', NULL, 'College Research Coordinator', 5, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:05:20', 'approved'),
(22, 'cah_coord', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'cah.coord@example.com', 'CAH', 'Research Coordinator', NULL, 'College Research Coordinator', 6, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:05:20', 'approved'),
(23, 'chs_coord', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'chs.coord@example.com', 'CHS', 'Research Coordinator', NULL, 'College Research Coordinator', 7, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:05:20', 'approved'),
(24, 'gs_coord', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'gs.coord@example.com', 'GS', 'Research Coordinator', NULL, 'College Research Coordinator', 8, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:05:20', 'approved'),
(25, 'cs_dean', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'cs.dean@example.com', 'Anelita', 'Obrar', NULL, 'College Dean', 1, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:08:23', 'approved'),
(26, 'coe_dean', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'coe.dean@example.com', 'COE', 'Dean', NULL, 'College Dean', 2, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:08:23', 'approved'),
(27, 'coed_dean', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'coed.dean@example.com', 'COED', 'Dean', NULL, 'College Dean', 3, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:08:23', 'approved'),
(28, 'cba_dean', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'cba.dean@example.com', 'CBA', 'Dean', NULL, 'College Dean', 4, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:08:23', 'approved'),
(29, 'caf_dean', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'caf.dean@example.com', 'CAF', 'Dean', NULL, 'College Dean', 5, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:08:23', 'approved'),
(30, 'cah_dean', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'cah.dean@example.com', 'CAH', 'Dean', NULL, 'College Dean', 6, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:08:23', 'approved'),
(31, 'chs_dean', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'chs.dean@example.com', 'CHS', 'Dean', NULL, 'College Dean', 7, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:08:23', 'approved'),
(32, 'gs_dean', '$2y$10$1Tgy9S2.iJUnlGmJGTmwQOfYsgvHOPPEt88JpQXF1dORZv7ATw19G', 'gs.dean@example.com', 'GS', 'Dean', NULL, 'College Dean', 8, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-15 12:08:23', 'pending'),
(33, 'AbelFlores', '$2y$10$OV3h6EyH00OvLB62PWo0TuImGjWQnrw0jfLSEMCsPRJ8iQiKQNGSi', 'abelflores@gmail.com', 'Abel', 'Flores', '09602145440', 'Faculty Researcher', 1, 1, 'MAIN', '', '', NULL, 1, '2025-12-17 02:05:43', 'approved'),
(34, 'marineldeasis', '$2y$10$EVEWmWul.j55De7JCeePfeA4l.A5RTL0BhBNIPQnftFoZRw9RDMxi', 'soleilneuzep9342@privumail.com', 'Marinel ', 'De Asis ', '09776923370', 'Faculty Researcher', 1, 4, 'MAIN', '', '', NULL, 1, '2025-12-17 04:31:52', 'approved'),
(35, 'evaluator', '$2y$10$yAcrCU/l1aPyTvIT7vjdZep23WTOlzdPVYtQbB/wvxCupfLmxjKH2', 'evaluator@example.com', 'Evaluator', 'User', '', 'Evaluator', NULL, NULL, 'MAIN', 'Evaluator', '', NULL, 1, '2026-05-04 06:47:50', 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `workplan_items`
--

CREATE TABLE `workplan_items` (
  `id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `activity` text NOT NULL,
  `q1` tinyint(1) DEFAULT 0,
  `q2` tinyint(1) DEFAULT 0,
  `q3` tinyint(1) DEFAULT 0,
  `q4` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `y1_q1` tinyint(4) DEFAULT 0,
  `y1_q2` tinyint(4) DEFAULT 0,
  `y1_q3` tinyint(4) DEFAULT 0,
  `y1_q4` tinyint(4) DEFAULT 0,
  `y2_q1` tinyint(4) DEFAULT 0,
  `y2_q2` tinyint(4) DEFAULT 0,
  `y2_q3` tinyint(4) DEFAULT 0,
  `y2_q4` tinyint(4) DEFAULT 0,
  `y3_q1` tinyint(4) DEFAULT 0,
  `y3_q2` tinyint(4) DEFAULT 0,
  `y3_q3` tinyint(4) DEFAULT 0,
  `y3_q4` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workplan_items`
--

INSERT INTO `workplan_items` (`id`, `proposal_id`, `activity`, `q1`, `q2`, `q3`, `q4`, `created_at`, `updated_at`, `y1_q1`, `y1_q2`, `y1_q3`, `y1_q4`, `y2_q1`, `y2_q2`, `y2_q3`, `y2_q4`, `y3_q1`, `y3_q2`, `y3_q3`, `y3_q4`) VALUES
(1, 18, 'sdfg', 1, 1, 0, 0, '2025-12-14 19:15:39', '2025-12-15 12:53:56', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(2, 18, 'dfsdgnh', 0, 0, 1, 1, '2025-12-14 19:15:39', '2025-12-15 12:53:56', 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(3, 19, 'wergthyj', 1, 0, 0, 0, '2025-12-14 19:19:21', '2025-12-15 12:53:56', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(4, 19, 'srydtyj', 0, 1, 1, 1, '2025-12-14 19:19:21', '2025-12-15 12:53:56', 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(5, 20, 'Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals)', 0, 1, 0, 0, '2025-12-14 21:32:21', '2025-12-15 12:53:56', 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(6, 20, 'Presentation and approval of the research study', 0, 0, 0, 0, '2025-12-14 21:32:21', '2025-12-14 21:32:21', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(7, 20, 'Assess the effectiveness of the existing workload computation template', 0, 1, 0, 0, '2025-12-14 21:32:21', '2025-12-15 12:53:56', 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(8, 20, 'Procurement of equipment and materials', 0, 0, 1, 0, '2025-12-14 21:32:21', '2025-12-15 12:53:56', 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(9, 20, 'Follow up interviews and focus group discussions with the head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals', 0, 0, 0, 0, '2025-12-14 21:32:21', '2025-12-14 21:32:21', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(10, 20, 'Conduct preliminary investigation and detailed data gathering', 0, 0, 0, 0, '2025-12-14 21:32:21', '2025-12-14 21:32:21', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(11, 20, 'Analyze and assess the scope and requirements of the research study', 0, 0, 0, 0, '2025-12-14 21:32:21', '2025-12-14 21:32:21', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(12, 20, 'Conduct the System Development Life Cycle', 0, 0, 0, 0, '2025-12-14 21:32:21', '2025-12-14 21:32:21', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(13, 20, 'Conduct training to the head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals', 0, 0, 0, 0, '2025-12-14 21:32:21', '2025-12-14 21:32:21', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(14, 20, 'Conduct an assessment on the acceptability of the Workload Computation System through survey', 0, 0, 0, 0, '2025-12-14 21:32:21', '2025-12-14 21:32:21', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(15, 20, 'Write terminal report, present completed extension project, write, and publish paper', 0, 0, 0, 0, '2025-12-14 21:32:21', '2025-12-14 21:32:21', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(16, 21, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(17, 21, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(18, 21, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(19, 21, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(20, 21, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(21, 21, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(22, 21, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(23, 21, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(24, 21, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(25, 21, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(26, 21, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-15 11:15:52', '2025-12-15 11:15:52', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(27, 22, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(28, 22, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(29, 22, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(30, 22, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(31, 22, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(32, 22, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(33, 22, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(34, 22, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(35, 22, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(36, 22, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(37, 22, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-15 11:21:38', '2025-12-15 11:21:38', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(38, 23, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(39, 23, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(40, 23, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(41, 23, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(42, 23, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(43, 23, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(44, 23, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(45, 23, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(46, 23, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(47, 23, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(48, 23, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-15 11:32:36', '2025-12-15 11:32:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(49, 24, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(50, 24, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(51, 24, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(52, 24, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(53, 24, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(54, 24, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(55, 24, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(56, 24, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(57, 24, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(58, 24, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(59, 24, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-15 12:29:26', '2025-12-15 12:29:26', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(60, 25, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(61, 25, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(62, 25, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(63, 25, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0),
(64, 25, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0),
(65, 25, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0),
(66, 25, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(67, 25, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
(68, 25, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
(69, 25, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(70, 25, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-15 12:56:04', '2025-12-15 12:56:04', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(71, 26, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(72, 26, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(73, 26, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(74, 26, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(75, 26, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(76, 26, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(77, 26, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(78, 26, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(79, 26, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(80, 26, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(81, 26, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-15 13:09:08', '2025-12-15 13:09:08', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(82, 27, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(83, 27, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1),
(84, 27, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(85, 27, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(86, 27, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(87, 27, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(88, 27, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(89, 27, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(90, 27, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(91, 27, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(92, 27, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-15 13:18:15', '2025-12-15 13:18:15', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(93, 28, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(94, 28, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1),
(95, 28, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(96, 28, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(97, 28, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(98, 28, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(99, 28, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(100, 28, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(101, 28, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(102, 28, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(103, 28, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-16 16:39:29', '2025-12-16 16:39:29', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(104, 29, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(105, 29, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(106, 29, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0),
(107, 29, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0),
(108, 29, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0),
(109, 29, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1),
(110, 29, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0),
(111, 29, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0),
(112, 29, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0),
(113, 29, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(114, 29, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-16 17:00:54', '2025-12-16 17:00:54', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(115, 30, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
(116, 30, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(117, 30, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(118, 30, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(119, 30, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(120, 30, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(121, 30, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(122, 30, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(123, 30, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(124, 30, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(125, 30, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-16 17:04:12', '2025-12-16 17:04:12', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(126, 31, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0),
(127, 31, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(128, 31, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(129, 31, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(130, 31, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(131, 31, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(132, 31, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(133, 31, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(134, 31, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(135, 31, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(136, 31, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-16 17:06:36', '2025-12-16 17:06:36', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(137, 32, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0),
(138, 32, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(139, 32, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(140, 32, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(141, 32, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(142, 32, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(143, 32, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(144, 32, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(145, 32, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(146, 32, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(147, 32, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-16 17:35:06', '2025-12-16 17:35:06', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(148, 33, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(149, 33, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
(150, 33, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(151, 33, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(152, 33, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(153, 33, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(154, 33, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(155, 33, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(156, 33, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(157, 33, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(158, 33, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-16 17:47:43', '2025-12-16 17:47:43', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(159, 34, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(160, 34, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(161, 34, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(162, 34, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(163, 34, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(164, 34, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(165, 34, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(166, 34, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(167, 34, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(168, 34, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(169, 34, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-16 17:56:42', '2025-12-16 17:56:42', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(170, 35, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(171, 35, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(172, 35, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(173, 35, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(174, 35, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(175, 35, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(176, 35, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(177, 35, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(178, 35, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(179, 35, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(180, 35, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-16 17:59:51', '2025-12-16 17:59:51', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(181, 36, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(182, 36, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0),
(183, 36, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
(184, 36, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(185, 36, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(186, 36, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0),
(187, 36, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(188, 36, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0),
(189, 36, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(190, 36, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(191, 36, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-17 02:18:50', '2025-12-17 02:18:50', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(192, 37, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(193, 37, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(194, 37, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(195, 37, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0),
(196, 37, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(197, 37, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(198, 37, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(199, 37, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(200, 37, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(201, 37, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(202, 37, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-17 04:41:49', '2025-12-17 04:41:49', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(203, 38, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(204, 38, '2. Presentation and approval of the research study;', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(205, 38, '3. Assess the effectiveness of the existing workload computation template;', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0),
(206, 38, '4. Procurement of equipment and materials;', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
(207, 38, '5. Follow up Interviews and focus group discussions;', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(208, 38, '6. Conduct preliminary Investigation and detailed data gathering;', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(209, 38, '7. Analyze and assess the scope and requirements;', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(210, 38, '8. Conduct the System Development Life Cycle;', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(211, 38, '9. Conduct Training sessions;', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(212, 38, '10. Conduct acceptability assessment of the system;', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(213, 38, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2025-12-17 05:57:23', '2025-12-17 05:57:23', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(214, 39, 'khajlkj', 0, 0, 0, 0, '2026-03-14 06:32:14', '2026-03-14 06:32:14', 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0),
(215, 39, 'gvhbkj', 0, 0, 0, 0, '2026-03-14 06:32:14', '2026-03-14 06:32:14', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(216, 40, 'gjhgkh', 0, 0, 0, 0, '2026-03-14 06:41:41', '2026-03-14 06:41:41', 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0),
(217, 40, 'hkjhl', 0, 0, 0, 0, '2026-03-14 06:41:41', '2026-03-14 06:41:41', 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0),
(218, 41, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2026-03-16 03:56:25', '2026-03-16 03:56:25', 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(219, 42, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2026-03-16 06:55:08', '2026-03-16 06:55:08', 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(220, 42, '2. dfgh', 0, 0, 0, 0, '2026-03-16 06:55:08', '2026-03-16 06:55:08', 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0),
(221, 43, 'ajkhfja', 0, 0, 0, 0, '2026-03-16 07:03:49', '2026-03-16 07:03:49', 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0),
(222, 43, 'a', 0, 0, 0, 0, '2026-03-16 07:03:49', '2026-03-16 07:03:49', 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0),
(223, 44, '1. Conduct consultation with the client (Head of instruction of the two external campuses, college secretaries, department chairs, and laboratory school principals);', 0, 0, 0, 0, '2026-03-16 07:06:32', '2026-03-16 07:06:32', 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(224, 45, 'Submit paper', 0, 0, 0, 0, '2026-04-16 02:47:15', '2026-04-16 02:47:15', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(225, 45, 'sdgg', 0, 0, 0, 0, '2026-04-16 02:47:15', '2026-04-16 02:47:15', 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0),
(226, 46, 'Submit paper', 0, 0, 0, 0, '2026-04-16 02:57:32', '2026-04-16 02:57:32', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(227, 47, '1. Conduct consultation with the client.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(228, 47, '2. Presentation and approval of the research study.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(229, 47, '3. Assess the effectiveness of existing systems or practices.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
(230, 47, '4. Procurement of equipment and materials.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0),
(231, 47, '5. Follow-up interviews and focus group discussions.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(232, 47, '6. Conduct preliminary investigation and data gathering.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(233, 47, '7. Analyze and assess the scope and requirements.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(234, 47, '8. Conduct the System Development Life Cycle.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(235, 47, '9. Conduct training sessions.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(236, 47, '10. Conduct acceptability assessment.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(237, 47, '11. Write terminal report and publish paper.', 0, 0, 0, 0, '2026-05-02 17:03:59', '2026-05-02 17:03:59', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(238, 48, 'dwnwn', 0, 0, 0, 0, '2026-05-04 05:51:04', '2026-05-04 05:51:04', 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0),
(239, 48, 'wdnwk', 0, 0, 0, 0, '2026-05-04 05:51:04', '2026-05-04 05:51:04', 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `published_by` (`published_by`);

--
-- Indexes for table `boardapprovals`
--
ALTER TABLE `boardapprovals`
  ADD PRIMARY KEY (`approval_id`),
  ADD KEY `proposal_id` (`proposal_id`);

--
-- Indexes for table `colleges`
--
ALTER TABLE `colleges`
  ADD PRIMARY KEY (`college_id`),
  ADD UNIQUE KEY `college_code` (`college_code`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Indexes for table `director_reviews`
--
ALTER TABLE `director_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `proposal_id` (`proposal_id`),
  ADD KEY `director_id` (`director_id`);

--
-- Indexes for table `evaluators`
--
ALTER TABLE `evaluators`
  ADD PRIMARY KEY (`evaluator_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `inhousereviews`
--
ALTER TABLE `inhousereviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `proposal_id` (`proposal_id`);

--
-- Indexes for table `monetaryincentives`
--
ALTER TABLE `monetaryincentives`
  ADD PRIMARY KEY (`incentive_id`),
  ADD KEY `proposal_id` (`proposal_id`),
  ADD KEY `researcher_id` (`researcher_id`);

--
-- Indexes for table `proposalcoresearchers`
--
ALTER TABLE `proposalcoresearchers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_id` (`proposal_id`),
  ADD KEY `researcher_id` (`researcher_id`);

--
-- Indexes for table `proposalevaluations`
--
ALTER TABLE `proposalevaluations`
  ADD PRIMARY KEY (`evaluation_id`),
  ADD KEY `proposal_id` (`proposal_id`),
  ADD KEY `evaluator_id` (`evaluator_id`),
  ADD KEY `review_id` (`review_id`);

--
-- Indexes for table `proposalversions`
--
ALTER TABLE `proposalversions`
  ADD PRIMARY KEY (`version_id`),
  ADD KEY `proposal_id` (`proposal_id`);

--
-- Indexes for table `proposal_equipment`
--
ALTER TABLE `proposal_equipment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_id` (`proposal_id`);

--
-- Indexes for table `proposal_hierarchy`
--
ALTER TABLE `proposal_hierarchy`
  ADD PRIMARY KEY (`hierarchy_id`),
  ADD KEY `idx_hierarchy_proposal` (`proposal_id`);

--
-- Indexes for table `proposal_history`
--
ALTER TABLE `proposal_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `proposal_id` (`proposal_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `proposal_mooe`
--
ALTER TABLE `proposal_mooe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_id` (`proposal_id`);

--
-- Indexes for table `proposal_ps`
--
ALTER TABLE `proposal_ps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_id` (`proposal_id`);

--
-- Indexes for table `researchfunding`
--
ALTER TABLE `researchfunding`
  ADD PRIMARY KEY (`funding_id`),
  ADD KEY `proposal_id` (`proposal_id`);

--
-- Indexes for table `researchproposals`
--
ALTER TABLE `researchproposals`
  ADD PRIMARY KEY (`proposal_id`),
  ADD KEY `researcher_id` (`user_id`),
  ADD KEY `college_id` (`college_id`);

--
-- Indexes for table `reviewpanels`
--
ALTER TABLE `reviewpanels`
  ADD PRIMARY KEY (`panel_id`),
  ADD KEY `review_id` (`review_id`),
  ADD KEY `evaluator_id` (`evaluator_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`name`);

--
-- Indexes for table `twgevaluations`
--
ALTER TABLE `twgevaluations`
  ADD PRIMARY KEY (`twg_evaluation_id`),
  ADD KEY `proposal_id` (`proposal_id`),
  ADD KEY `evaluator_id` (`evaluator_id`);

--
-- Indexes for table `urecreviews`
--
ALTER TABLE `urecreviews`
  ADD PRIMARY KEY (`urec_review_id`),
  ADD KEY `proposal_id` (`proposal_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `users_college_fk` (`college_id`);

--
-- Indexes for table `workplan_items`
--
ALTER TABLE `workplan_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_workplan_proposal` (`proposal_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `boardapprovals`
--
ALTER TABLE `boardapprovals`
  MODIFY `approval_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `director_reviews`
--
ALTER TABLE `director_reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluators`
--
ALTER TABLE `evaluators`
  MODIFY `evaluator_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inhousereviews`
--
ALTER TABLE `inhousereviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `monetaryincentives`
--
ALTER TABLE `monetaryincentives`
  MODIFY `incentive_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposalcoresearchers`
--
ALTER TABLE `proposalcoresearchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposalevaluations`
--
ALTER TABLE `proposalevaluations`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposalversions`
--
ALTER TABLE `proposalversions`
  MODIFY `version_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposal_equipment`
--
ALTER TABLE `proposal_equipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `proposal_hierarchy`
--
ALTER TABLE `proposal_hierarchy`
  MODIFY `hierarchy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `proposal_history`
--
ALTER TABLE `proposal_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `proposal_mooe`
--
ALTER TABLE `proposal_mooe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `proposal_ps`
--
ALTER TABLE `proposal_ps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `researchfunding`
--
ALTER TABLE `researchfunding`
  MODIFY `funding_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `researchproposals`
--
ALTER TABLE `researchproposals`
  MODIFY `proposal_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `reviewpanels`
--
ALTER TABLE `reviewpanels`
  MODIFY `panel_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `twgevaluations`
--
ALTER TABLE `twgevaluations`
  MODIFY `twg_evaluation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `urecreviews`
--
ALTER TABLE `urecreviews`
  MODIFY `urec_review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `workplan_items`
--
ALTER TABLE `workplan_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=240;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`published_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `boardapprovals`
--
ALTER TABLE `boardapprovals`
  ADD CONSTRAINT `boardapprovals_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`);

--
-- Constraints for table `director_reviews`
--
ALTER TABLE `director_reviews`
  ADD CONSTRAINT `director_reviews_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`),
  ADD CONSTRAINT `director_reviews_ibfk_2` FOREIGN KEY (`director_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `evaluators`
--
ALTER TABLE `evaluators`
  ADD CONSTRAINT `evaluators_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `inhousereviews`
--
ALTER TABLE `inhousereviews`
  ADD CONSTRAINT `inhousereviews_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`);

--
-- Constraints for table `monetaryincentives`
--
ALTER TABLE `monetaryincentives`
  ADD CONSTRAINT `monetaryincentives_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`),
  ADD CONSTRAINT `monetaryincentives_ibfk_2` FOREIGN KEY (`researcher_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `proposalcoresearchers`
--
ALTER TABLE `proposalcoresearchers`
  ADD CONSTRAINT `proposalcoresearchers_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`),
  ADD CONSTRAINT `proposalcoresearchers_ibfk_2` FOREIGN KEY (`researcher_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `proposalevaluations`
--
ALTER TABLE `proposalevaluations`
  ADD CONSTRAINT `proposalevaluations_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`),
  ADD CONSTRAINT `proposalevaluations_ibfk_2` FOREIGN KEY (`evaluator_id`) REFERENCES `evaluators` (`evaluator_id`),
  ADD CONSTRAINT `proposalevaluations_ibfk_3` FOREIGN KEY (`review_id`) REFERENCES `inhousereviews` (`review_id`);

--
-- Constraints for table `proposalversions`
--
ALTER TABLE `proposalversions`
  ADD CONSTRAINT `proposalversions_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`) ON DELETE CASCADE;

--
-- Constraints for table `proposal_equipment`
--
ALTER TABLE `proposal_equipment`
  ADD CONSTRAINT `proposal_equipment_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`) ON DELETE CASCADE;

--
-- Constraints for table `proposal_hierarchy`
--
ALTER TABLE `proposal_hierarchy`
  ADD CONSTRAINT `fk_hierarchy_proposal` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`) ON DELETE CASCADE;

--
-- Constraints for table `proposal_history`
--
ALTER TABLE `proposal_history`
  ADD CONSTRAINT `proposal_history_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `proposal_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `proposal_mooe`
--
ALTER TABLE `proposal_mooe`
  ADD CONSTRAINT `proposal_mooe_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`) ON DELETE CASCADE;

--
-- Constraints for table `proposal_ps`
--
ALTER TABLE `proposal_ps`
  ADD CONSTRAINT `proposal_ps_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`) ON DELETE CASCADE;

--
-- Constraints for table `researchfunding`
--
ALTER TABLE `researchfunding`
  ADD CONSTRAINT `researchfunding_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`);

--
-- Constraints for table `reviewpanels`
--
ALTER TABLE `reviewpanels`
  ADD CONSTRAINT `reviewpanels_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `inhousereviews` (`review_id`),
  ADD CONSTRAINT `reviewpanels_ibfk_2` FOREIGN KEY (`evaluator_id`) REFERENCES `evaluators` (`evaluator_id`);

--
-- Constraints for table `twgevaluations`
--
ALTER TABLE `twgevaluations`
  ADD CONSTRAINT `twgevaluations_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`),
  ADD CONSTRAINT `twgevaluations_ibfk_2` FOREIGN KEY (`evaluator_id`) REFERENCES `evaluators` (`evaluator_id`);

--
-- Constraints for table `urecreviews`
--
ALTER TABLE `urecreviews`
  ADD CONSTRAINT `urecreviews_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_college_fk` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`college_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `workplan_items`
--
ALTER TABLE `workplan_items`
  ADD CONSTRAINT `fk_workplan_proposal` FOREIGN KEY (`proposal_id`) REFERENCES `researchproposals` (`proposal_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
