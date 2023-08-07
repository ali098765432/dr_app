-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 14, 2023 at 10:45 PM
-- Server version: 8.0.33-0ubuntu0.22.04.2
-- PHP Version: 8.1.2-1ubuntu2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `booking_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth`
--

CREATE TABLE `auth` (
  `id` int NOT NULL,
  `phone_no` varchar(13) NOT NULL,
  `otp` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;

--
-- Dumping data for table `auth`
--

INSERT INTO `auth` (`id`, `phone_no`, `otp`, `created_at`, `updated_at`) VALUES
(1, '919078475289', 202147, '2023-07-14 18:43:07', '2023-07-14 18:47:49');

-- --------------------------------------------------------

--
-- Table structure for table `availability`
--

CREATE TABLE `availability` (
  `id` int NOT NULL,
  `dr_id` int NOT NULL,
  `detail` json NOT NULL,
  `week_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;

--
-- Dumping data for table `availability`
--

INSERT INTO `availability` (`id`, `dr_id`, `detail`, `week_date`, `created_at`, `updated_at`) VALUES
(1, 1, '{\"Monday\": {\"0\": {\"to\": \"value\", \"from\": \"value\"}, \"1\": {\"to\": \"value\", \"from\": \"value\"}}, \"Wednesday\": {\"0\": {\"to\": \"value\", \"from\": \"value\"}, \"1\": {\"to\": \"value\", \"from\": \"value\"}, \"2\": {\"to\": \"value\", \"from\": \"value\"}}}', '2023-10-07', '2023-07-14 16:15:11', '2023-07-14 16:32:31'),
(2, 1, '{\"Monday\": {\"0\": {\"to\": \"value\", \"from\": \"value\"}, \"1\": {\"to\": \"value\", \"from\": \"value\"}, \"2\": {\"to\": \"value\", \"from\": \"value\"}}, \"Tuesday\": {\"0\": {\"to\": \"value\", \"from\": \"value\"}, \"1\": {\"to\": \"value\", \"from\": \"value\"}, \"2\": {\"to\": \"value\", \"from\": \"value\"}}}', '2023-10-07', '2023-07-14 16:15:35', '2023-07-14 16:15:35');

-- --------------------------------------------------------

--
-- Table structure for table `dr_users`
--

CREATE TABLE `dr_users` (
  `id` int NOT NULL,
  `f_name` varchar(255) NOT NULL,
  `l_name` varchar(255) NOT NULL,
  `phone_no` varchar(13) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `gender` varchar(255) NOT NULL,
  `profession` varchar(255) NOT NULL,
  `hospital` varchar(255) NOT NULL,
  `experience` varchar(255) NOT NULL,
  `fee` int DEFAULT NULL,
  `img` blob,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `dr_users`
--

INSERT INTO `dr_users` (`id`, `f_name`, `l_name`, `phone_no`, `email`, `address`, `gender`, `profession`, `hospital`, `experience`, `fee`, `img`, `created_at`, `updated_at`) VALUES
(1, 'dummy', 'dr', '919078475289', 'uyerue', 'dummy address', 'male', 'dr', 'here', '2', 12, NULL, '2023-07-13 16:04:04', '2023-07-14 18:46:15'),
(3, 'dummy2', 'dr', '23457777767', 'uyerue', 'dummy address', 'male', 'dr', 'here', '2', 12, NULL, '2023-07-13 22:01:18', '2023-07-13 22:01:18'),
(4, 'dummy3', 'dr', '234577789', 'uyerue', 'dummy address', 'male', 'dr', 'here', '2', 12, NULL, '2023-07-13 22:02:04', '2023-07-13 22:02:04'),
(6, 'dummy4_updated', 'dr', '2345232789', 'uyerue', 'dummy address', 'male', 'dr', 'here', '2', 12, NULL, '2023-07-13 22:03:43', '2023-07-14 01:19:43');

-- --------------------------------------------------------

--
-- Table structure for table `earnings`
--

CREATE TABLE `earnings` (
  `id` int NOT NULL,
  `dr_id` int NOT NULL,
  `pa_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `charges` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;

--
-- Dumping data for table `earnings`
--

INSERT INTO `earnings` (`id`, `dr_id`, `pa_id`, `visit_id`, `charges`, `created_at`) VALUES
(1, 1, 2, 1, 500, '2023-07-14 11:27:37'),
(2, 1, 2, 1, 500, '2023-07-14 22:12:16');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `dr_id` int DEFAULT NULL,
  `pa_id` int DEFAULT NULL,
  `event` varchar(255) NOT NULL,
  `detail` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `dr_id`, `pa_id`, `event`, `detail`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'Cancel event', 'Booking cancel', '2023-07-13 23:16:31', '2023-07-13 23:16:31'),
(2, NULL, NULL, 'App event', 'Update available', '2023-07-14 22:31:16', '2023-07-14 22:31:16');

-- --------------------------------------------------------

--
-- Table structure for table `pa_users`
--

CREATE TABLE `pa_users` (
  `id` int NOT NULL,
  `f_name` varchar(255) NOT NULL,
  `l_name` varchar(255) NOT NULL,
  `phone_no` varchar(13) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `img` blob,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;

--
-- Dumping data for table `pa_users`
--

INSERT INTO `pa_users` (`id`, `f_name`, `l_name`, `phone_no`, `email`, `gender`, `address`, `img`, `created_at`, `updated_at`) VALUES
(1, 'pateint1', 'sammy', '234522232789', 'uyerue', 'male', 'dummy address', NULL, '2023-07-14 10:58:53', '2023-07-14 10:58:53');

-- --------------------------------------------------------

--
-- Table structure for table `rating_reviews`
--

CREATE TABLE `rating_reviews` (
  `id` int NOT NULL,
  `dr_id` int NOT NULL,
  `pa_id` int NOT NULL,
  `review` text NOT NULL,
  `rating` float NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;

--
-- Dumping data for table `rating_reviews`
--

INSERT INTO `rating_reviews` (`id`, `dr_id`, `pa_id`, `review`, `rating`, `created_at`, `updated_at`) VALUES
(2, 2, 1, 'Good one', 3.5, '2023-07-13 22:53:22', '2023-07-13 22:53:22');

-- --------------------------------------------------------

--
-- Table structure for table `visits`
--

CREATE TABLE `visits` (
  `id` int NOT NULL,
  `dr_id` int NOT NULL,
  `pa_id` int NOT NULL,
  `visit_no` int NOT NULL,
  `charges` int NOT NULL,
  `detail` json NOT NULL,
  `is_pending` tinyint(1) NOT NULL DEFAULT '1',
  `is_done` tinyint(1) NOT NULL DEFAULT '0',
  `is_rejected` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;

--
-- Dumping data for table `visits`
--

INSERT INTO `visits` (`id`, `dr_id`, `pa_id`, `visit_no`, `charges`, `detail`, `is_pending`, `is_done`, `is_rejected`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 122, 500, '{\"to\": \"14:00\", \"day\": \"Monday\", \"from\": \"12:00\"}', 1, 0, 0, '2023-07-14 11:35:12', '2023-07-14 11:35:12'),
(2, 1, 2, 122, 500, '{\"to\": \"14:00\", \"day\": \"Tuesday\", \"from\": \"12:00\"}', 1, 0, 0, '2023-07-14 16:12:46', '2023-07-14 16:12:46');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth`
--
ALTER TABLE `auth`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone_no` (`phone_no`);

--
-- Indexes for table `availability`
--
ALTER TABLE `availability`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dr_users`
--
ALTER TABLE `dr_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone_no` (`phone_no`);

--
-- Indexes for table `earnings`
--
ALTER TABLE `earnings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pa_users`
--
ALTER TABLE `pa_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone_no` (`phone_no`);

--
-- Indexes for table `rating_reviews`
--
ALTER TABLE `rating_reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `visits`
--
ALTER TABLE `visits`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth`
--
ALTER TABLE `auth`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `availability`
--
ALTER TABLE `availability`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `dr_users`
--
ALTER TABLE `dr_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `earnings`
--
ALTER TABLE `earnings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pa_users`
--
ALTER TABLE `pa_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rating_reviews`
--
ALTER TABLE `rating_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `visits`
--
ALTER TABLE `visits`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
