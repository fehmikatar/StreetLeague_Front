USE piDB;

-- Insert user subclasses
INSERT IGNORE INTO players (id, games_played, rating, skill_level, position) VALUES (9, 10, 8.5, 5, 'Forward');
INSERT IGNORE INTO players (id, games_played, rating, skill_level, position) VALUES (1, 10, 8.5, 5, 'Defender');
INSERT IGNORE INTO team_managers (id, experience, team_name) VALUES (9, '5 years', 'Thunder Strikers');
INSERT IGNORE INTO team_managers (id, experience, team_name) VALUES (1, '10 years', 'Red Devils');

-- Team 1
INSERT INTO teams (name, description, city, level, sport, status, created_by_id, manager_id, created_at) 
VALUES ('Thunder Strikers', 'Equipe de choc', 'Paris', 'Pro', 'Football', 'ACTIVE', 9, 9, NOW());
SET @team1_id = LAST_INSERT_ID();

-- Team 2
INSERT INTO teams (name, description, city, level, sport, status, created_by_id, manager_id, created_at) 
VALUES ('Red Devils', 'Adversaires coriaces', 'Lyon', 'Amateur', 'Football', 'ACTIVE', 1, 1, NOW());
SET @team2_id = LAST_INSERT_ID();

-- Add superplayer to Thunder Strikers
INSERT INTO team_member (team_id, user_id, role) VALUES (@team1_id, 9, 'RESPONSIBLE');

-- Competition
INSERT INTO competitions (name, description, format, status, is_individual_sport, sport_type, start_date, end_date)
VALUES ('Street League Championship', 'Tournoi estival', 'KNOCKOUT', 'ONGOING', 0, 'Football', '2026-06-01', '2026-08-30');
SET @comp_id = LAST_INSERT_ID();

-- Match 1 (Finished)
INSERT INTO matches (competition_id, home_team_id, away_team_id, status, scheduled_at, started_at, home_score, away_score, round)
VALUES (@comp_id, @team1_id, @team2_id, 'FINISHED', '2026-05-01 18:00:00', '2026-05-01 18:05:00', 3, 1, 'Group Stage');
SET @match1_id = LAST_INSERT_ID();

-- Match 2 (Scheduled)
INSERT INTO matches (competition_id, home_team_id, away_team_id, status, scheduled_at, round)
VALUES (@comp_id, @team2_id, @team1_id, 'SCHEDULED', '2026-05-10 20:00:00', 'Group Stage');
SET @match2_id = LAST_INSERT_ID();

-- Performance for superplayer in Match 1
INSERT INTO performance (player_id, match_id, score, assists, time_played, distance_covered, rating, created_at, updated_at)
VALUES (9, @match1_id, 2, 1, 90, 10.5, 8.5, NOW(), NOW());

-- Performance history
INSERT INTO performance (player_id, match_id, score, assists, time_played, distance_covered, rating, created_at, updated_at)
VALUES (9, NULL, 1, 0, 45, 5.2, 7.0, '2026-04-20 10:00:00', '2026-04-20 10:00:00');
INSERT INTO performance (player_id, match_id, score, assists, time_played, distance_covered, rating, created_at, updated_at)
VALUES (9, NULL, 0, 2, 90, 11.0, 8.0, '2026-04-25 10:00:00', '2026-04-25 10:00:00');

-- Player Level
INSERT INTO player_level (player_id, current_level, total_xp) VALUES (9, 12, 2450) ON DUPLICATE KEY UPDATE current_level=12, total_xp=2450;
