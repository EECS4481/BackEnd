-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 19, 2022 at 08:31 PM
-- Server version: 10.4.22-MariaDB
-- PHP Version: 8.1.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project4481-2.0`
--
CREATE DATABASE `project4481-2.0`;
USE `project4481-2.0`;
-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `client_id` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`client_id`) VALUES
('C400'),
('C410');

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `message_id` bigint(20) NOT NULL,
  `sender_id` varchar(10) NOT NULL,
  `receiver_id` varchar(10) NOT NULL,
  `content` longtext NOT NULL,
  `TIMESTAMP` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`message_id`, `sender_id`, `receiver_id`, `content`, `TIMESTAMP`) VALUES
(1, 'P1', 'C400', 'Hi', '2022-02-19 00:00:00'),
(2, 'P1', 'C400', 'How you doin', '2022-02-19 00:00:00'),
(3, 'C400', 'P1', 'Thanks', '2022-02-19 00:00:00'),
(4, 'C400', 'P1', 'Bye', '2022-02-19 00:00:00'),
(5, 'P1', 'C400', 'So long', '2022-02-19 00:00:00'),
(6, 'C400', 'P2', 'ABCD', '2022-02-19 13:24:52'),
(7, 'P2', 'C400', 'dcba', '2022-02-19 13:24:52'),
(8, 'C400', 'P2', 'ABCD2', '2022-02-19 13:25:13'),
(9, 'P2', 'C400', 'dcba2', '2022-02-19 13:25:13'),
(31, 'P3', 'C410', 'qwerty', '2022-02-19 14:29:19'),
(32, 'C410', 'P3', 'qwerty1234', '2022-02-19 14:29:35'),
(33, 'C400', 'P1', 'qwerty1234', '2022-02-19 14:29:49');

-- --------------------------------------------------------

--
-- Table structure for table `provider`
--

CREATE TABLE `provider` (
  `provider_id` varchar(10) NOT NULL,
  `name` varchar(30) NOT NULL,
  `email` varchar(30) NOT NULL,
  `password` varchar(255) NOT NULL,
  `password_nothash` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `provider`
--

INSERT INTO `provider` (`provider_id`, `name`, `email`, `password`, `password_nothash`) VALUES
('P1', 'Simon Riley', 'simon@gmail.com', 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', 'B1t9Dun$UMSwEmg1'),
('P2', 'John Price', 'john@yahoo.com', 'e24df920078c3dd4e7e8d2442f00e5c9ab2a231bb3918d65cc50906e49ecaef4', '^d2H4JRjkK8Y#*Fx'),
('P3', 'John MacTavish', 'john@gmail.com', 'f6ee94ecb014f74f887b9dcc52daecf73ab3e3333320cadd98bcb59d895c52f5', '*N4A4igDYnJiQ7Lc');

--
-- Indexes for dumped tables
--

CREATE TABLE `sessions` (
  `id` varchar(10) NOT NULL,
  `session` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
COMMIT;

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`client_id`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`message_id`);

--
-- Indexes for table `provider`
--
ALTER TABLE `provider`
  ADD PRIMARY KEY (`provider_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `message_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;