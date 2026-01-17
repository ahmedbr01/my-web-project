-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 13 jan. 2026 à 14:22
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
-- Base de données : `sadraoui_construction`
--

-- --------------------------------------------------------

--
-- Structure de la table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `clientName` varchar(255) NOT NULL,
  `clientEmail` varchar(255) NOT NULL,
  `clientPhone` varchar(20) NOT NULL,
  `projectAddress` text NOT NULL,
  `projectType` enum('construction','renovation','extension','interior') NOT NULL,
  `surface` decimal(10,2) NOT NULL,
  `budget` varchar(50) DEFAULT NULL,
  `tasks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tasks`)),
  `additionalTasks` text DEFAULT NULL,
  `deadline` varchar(50) DEFAULT NULL,
  `style` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','in_progress','problem','resolved','completed') DEFAULT 'pending',
  `userId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','client') DEFAULT 'client',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `prenom`, `nom`, `telephone`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Test', 'User', NULL, 'test@test.com', '$2a$12$yLr4OjqRq8P8k7w9V6zXe.FYDq9nT8KJmQ7W6b5C3D2E1V0A9B8C7', 'client', '2026-01-12 15:22:54', '2026-01-12 15:22:54'),
(2, 'Ahmed', 'Test', '28728067', 'ahmed@test.com', '$2a$12$XupbeEOMgC5UkEA6HireeuaFavd7txRF/Kwfoh88synD0xUQ0cd5q', 'client', '2026-01-12 15:24:47', '2026-01-12 15:24:47'),
(3, 'rahma', 'ben_slimen', '23355029', 'rahma@gmail.com', '$2a$12$uzxQ7IPc4IhddxoKmbe6i.YwkfwA9GeW8zw4cVZ8pnS9sTtvGLPNO', 'client', '2026-01-12 15:28:06', '2026-01-12 15:28:06'),
(4, 'HAZEM', 'BENRAHMA', '28728074', 'benrahmahazem123@gmail.com', '$2a$12$yHgupFhSn1gMLhHRiGiP3.fxb.mTaIY7tXGsUq25RA3cyzIyoLGKS', 'client', '2026-01-12 16:52:52', '2026-01-12 16:52:52'),
(5, 'Admin', 'System', NULL, 'admin@construction.com', '$2a$12$qT3k5KQJ3N4O5P6Q7R8S9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L', 'admin', '2026-01-13 13:21:38', '2026-01-13 13:21:38');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

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
-- AUTO_INCREMENT pour la table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
