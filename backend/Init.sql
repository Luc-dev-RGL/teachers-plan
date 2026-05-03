-- ============================================
-- TEACHER'S PLAN - Schéma Complet PostgreSQL
-- Tout en français
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ANNEES ACADEMIQUES ───
CREATE TABLE IF NOT EXISTS annees_academiques (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    libelle     VARCHAR(20) NOT NULL UNIQUE,
    date_debut  VARCHAR(10) NOT NULL,
    date_fin    VARCHAR(10) NOT NULL,
    actif       BOOLEAN DEFAULT FALSE,
    cree_le     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── DEPARTEMENTS ───
CREATE TABLE IF NOT EXISTS departements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(10) NOT NULL UNIQUE,
    nom         VARCHAR(100) NOT NULL,
    description TEXT,
    chef_id     UUID,
    cree_le     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── FILIERES ───
CREATE TABLE IF NOT EXISTS filieres (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) NOT NULL UNIQUE,
    nom             VARCHAR(100) NOT NULL,
    description     TEXT,
    departement_id  UUID NOT NULL REFERENCES departements(id) ON DELETE CASCADE,
    cree_le         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── NIVEAUX ───
CREATE TABLE IF NOT EXISTS niveaux (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(10) NOT NULL UNIQUE,
    nom         VARCHAR(50) NOT NULL,
    ordre       INTEGER DEFAULT 0,
    cree_le     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── CLASSES ───
CREATE TABLE IF NOT EXISTS classes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom         VARCHAR(100) NOT NULL,
    code        VARCHAR(20) NOT NULL UNIQUE,
    filiere_id  UUID NOT NULL REFERENCES filieres(id) ON DELETE CASCADE,
    niveau_id   UUID NOT NULL REFERENCES niveaux(id) ON DELETE CASCADE,
    effectif    INTEGER DEFAULT 0,
    cree_le     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── SALLES ───
CREATE TABLE IF NOT EXISTS salles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom         VARCHAR(100) NOT NULL,
    code        VARCHAR(20) NOT NULL UNIQUE,
    capacite    INTEGER DEFAULT 30,
    type        VARCHAR(30) DEFAULT 'standard',
    batiment    VARCHAR(50),
    cree_le     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── MATIERES ───
CREATE TABLE IF NOT EXISTS matieres (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) NOT NULL UNIQUE,
    nom             VARCHAR(100) NOT NULL,
    description     TEXT,
    credit          INTEGER DEFAULT 2,
    heures_cm       INTEGER DEFAULT 0,
    heures_td       INTEGER DEFAULT 0,
    heures_tp       INTEGER DEFAULT 0,
    type            VARCHAR(30) DEFAULT 'fondamentale',
    departement_id  UUID NOT NULL REFERENCES departements(id) ON DELETE CASCADE,
    cree_le         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── EQUIVALENCES ───
CREATE TABLE IF NOT EXISTS equivalences (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        VARCHAR(5) NOT NULL UNIQUE,
    coefficient NUMERIC(3,1) NOT NULL,
    description TEXT,
    cree_le     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── TAUX HORAIRES ───
CREATE TABLE IF NOT EXISTS taux_horaires (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categorie            VARCHAR(20) NOT NULL,
    type_seance          VARCHAR(5) NOT NULL,
    montant              NUMERIC(10,2) NOT NULL,
    annee_academique_id  UUID REFERENCES annees_academiques(id),
    cree_le              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── UTILISATEURS ───
CREATE TABLE IF NOT EXISTS utilisateurs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe  VARCHAR(255) NOT NULL,
    nom           VARCHAR(80) NOT NULL,
    prenom        VARCHAR(80) NOT NULL,
    role          VARCHAR(20) DEFAULT 'enseignant',
    actif         BOOLEAN DEFAULT TRUE,
    avatar        VARCHAR(255),
    cree_le       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── ENSEIGNANTS ───
CREATE TABLE IF NOT EXISTS enseignants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricule       VARCHAR(30) NOT NULL UNIQUE,
    utilisateur_id  UUID NOT NULL UNIQUE REFERENCES utilisateurs(id) ON DELETE CASCADE,
    departement_id  UUID REFERENCES departements(id),
    telephone       VARCHAR(20),
    date_naissance  VARCHAR(10),
    categorie       VARCHAR(20) DEFAULT 'Vacataire',
    grade           VARCHAR(50),
    statut          VARCHAR(20) DEFAULT 'actif',
    cree_le         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE departements ADD CONSTRAINT fk_departement_chef FOREIGN KEY (chef_id) REFERENCES enseignants(id) ON DELETE SET NULL;

-- ─── SEANCES DE COURS ───
CREATE TABLE IF NOT EXISTS seances_cours (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id        UUID NOT NULL REFERENCES enseignants(id),
    matiere_id           UUID NOT NULL REFERENCES matieres(id),
    classe_id            UUID NOT NULL REFERENCES classes(id),
    salle_id             UUID NOT NULL REFERENCES salles(id),
    annee_academique_id  UUID NOT NULL REFERENCES annees_academiques(id),
    date                 VARCHAR(10) NOT NULL,
    heure_debut          VARCHAR(5) NOT NULL,
    heure_fin            VARCHAR(5) NOT NULL,
    type_seance          VARCHAR(5) DEFAULT 'TD',
    statut               VARCHAR(20) DEFAULT 'planifiee',
    nombre_heures        NUMERIC(4,2) NOT NULL,
    remarques            TEXT,
    validee_par          UUID,
    date_validation      VARCHAR(10),
    cree_le              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── HEURES EFFECTUEES ───
CREATE TABLE IF NOT EXISTS heures_effectuees (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id        UUID NOT NULL REFERENCES enseignants(id),
    seance_cours_id      UUID NOT NULL UNIQUE REFERENCES seances_cours(id),
    annee_academique_id  UUID NOT NULL REFERENCES annees_academiques(id),
    type_seance          VARCHAR(5) NOT NULL,
    heures_reelles       NUMERIC(4,2) NOT NULL,
    coefficient          NUMERIC(3,1) NOT NULL,
    heures_equiv_td      NUMERIC(6,2) NOT NULL,
    taux_horaire         NUMERIC(10,2),
    montant_calcule      NUMERIC(10,2) DEFAULT 0,
    statut               VARCHAR(20) DEFAULT 'validee',
    mois                 VARCHAR(7),
    cree_le              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── PRESENCES ───
CREATE TABLE IF NOT EXISTS presences (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seance_cours_id  UUID NOT NULL REFERENCES seances_cours(id) ON DELETE CASCADE,
    enseignant_id    UUID NOT NULL REFERENCES enseignants(id),
    date             VARCHAR(10) NOT NULL,
    present          BOOLEAN DEFAULT TRUE,
    retard           INTEGER DEFAULT 0,
    remarques        TEXT,
    cree_le          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── JOURNAL D'AUDIT ───
CREATE TABLE IF NOT EXISTS journal_audit (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id  UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    action          VARCHAR(20) NOT NULL,
    entite          VARCHAR(50) NOT NULL,
    entite_id       UUID,
    details         TEXT,
    adresse_ip      VARCHAR(45),
    cree_le         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── REINITIALISATION MDP ───
CREATE TABLE IF NOT EXISTS reinitialisations_mdp (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id  UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    jeton           VARCHAR(255) NOT NULL UNIQUE,
    expire_le       TIMESTAMP NOT NULL,
    utilise         BOOLEAN DEFAULT FALSE,
    cree_le         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── PARAMETRES ───
CREATE TABLE IF NOT EXISTS parametres_etablissement (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_etablissement  VARCHAR(150) DEFAULT 'Université',
    adresse            TEXT,
    telephone          VARCHAR(20),
    email              VARCHAR(150),
    site_web           VARCHAR(255),
    logo               VARCHAR(255),
    logo_clair         VARCHAR(255),
    modifie_le         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parametres_niveaux (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    niveaux     TEXT DEFAULT 'L1,L2,L3,M1,M2',
    modifie_le  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parametres_semestres (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_semestres    INTEGER DEFAULT 2,
    debut_semestre_1    VARCHAR(10),
    fin_semestre_1      VARCHAR(10),
    debut_semestre_2    VARCHAR(10),
    fin_semestre_2      VARCHAR(10),
    modifie_le          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parametres_alertes (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alerte_heures_min         BOOLEAN DEFAULT TRUE,
    seuil_heures_min          INTEGER DEFAULT 100,
    alerte_conflit_salle     BOOLEAN DEFAULT TRUE,
    alerte_seance_sans_salle BOOLEAN DEFAULT FALSE,
    alerte_enseignant_inactif BOOLEAN DEFAULT TRUE,
    rappel_validation         BOOLEAN DEFAULT TRUE,
    delai_rappel_jours        INTEGER DEFAULT 7,
    modifie_le                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── INDEX ───
CREATE INDEX IF NOT EXISTS idx_seances_enseignant ON seances_cours(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_seances_classe ON seances_cours(classe_id);
CREATE INDEX IF NOT EXISTS idx_seances_salle ON seances_cours(salle_id);
CREATE INDEX IF NOT EXISTS idx_seances_date ON seances_cours(date);
CREATE INDEX IF NOT EXISTS idx_seances_statut ON seances_cours(statut);
CREATE INDEX IF NOT EXISTS idx_seances_annee ON seances_cours(annee_academique_id);
CREATE INDEX IF NOT EXISTS idx_heures_enseignant ON heures_effectuees(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_heures_annee ON heures_effectuees(annee_academique_id);
CREATE INDEX IF NOT EXISTS idx_presences_enseignant ON presences(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_enseignants_departement ON enseignants(departement_id);
CREATE INDEX IF NOT EXISTS idx_classes_filiere ON classes(filiere_id);
CREATE INDEX IF NOT EXISTS idx_classes_niveau ON classes(niveau_id);
CREATE INDEX IF NOT EXISTS idx_journal_utilisateur ON journal_audit(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_audit(cree_le);
-- ============================================
-- DONNEES INITIALES
-- ============================================

INSERT INTO annees_academiques (libelle, date_debut, date_fin, actif)
VALUES ('2024-2025', '2024-09-15', '2025-06-30', TRUE);

INSERT INTO departements (code, nom, description)
VALUES 
    ('INFO', 'Informatique', 'Département informatique et systèmes d''information'),
    ('MATH', 'Mathématiques', 'Département mathématiques et statistiques'),
    ('GCU', 'Génie Civil', 'Département génie civil et urbanisme');

INSERT INTO niveaux (code, nom, ordre)
VALUES 
    ('L1', 'Licence 1', 1),
    ('L2', 'Licence 2', 2),
    ('L3', 'Licence 3', 3),
    ('M1', 'Master 1', 4),
    ('M2', 'Master 2', 5);

INSERT INTO filieres (code, nom, description, departement_id)
SELECT 'LINFO', 'Licence Informatique', 'Formation fondamentale en informatique', id FROM departements WHERE code = 'INFO'
UNION ALL
SELECT 'MGL', 'Master Génie Logiciel', 'Spécialisation génie logiciel', id FROM departements WHERE code = 'INFO'
UNION ALL
SELECT 'LMATH', 'Licence Mathématiques', 'Formation mathématiques', id FROM departements WHERE code = 'MATH'
UNION ALL
SELECT 'LGCU', 'Licence Génie Civil', 'Formation génie civil', id FROM departements WHERE code = 'GCU';

INSERT INTO classes (nom, code, filiere_id, niveau_id, effectif)
SELECT 'L1 Informatique', 'L1-INFO', f.id, n.id, 45
FROM filieres f, niveaux n WHERE f.code = 'LINFO' AND n.code = 'L1'
UNION ALL
SELECT 'L2 Informatique', 'L2-INFO', f.id, n.id, 38
FROM filieres f, niveaux n WHERE f.code = 'LINFO' AND n.code = 'L2'
UNION ALL
SELECT 'L3 Informatique', 'L3-INFO', f.id, n.id, 30
FROM filieres f, niveaux n WHERE f.code = 'LINFO' AND n.code = 'L3'
UNION ALL
SELECT 'M1 Génie Logiciel', 'M1-GL', f.id, n.id, 25
FROM filieres f, niveaux n WHERE f.code = 'MGL' AND n.code = 'M1'
UNION ALL
SELECT 'L1 Mathématiques', 'L1-MATH', f.id, n.id, 50
FROM filieres f, niveaux n WHERE f.code = 'LMATH' AND n.code = 'L1';

INSERT INTO salles (nom, code, capacite, type, batiment)
VALUES 
    ('Amphi A', 'AMP-A', 200, 'amphitheatre', 'Bâtiment A'),
    ('Salle A101', 'A101', 40, 'standard', 'Bâtiment A'),
    ('Salle A102', 'A102', 35, 'standard', 'Bâtiment A'),
    ('Laboratoire Info 1', 'LAB-1', 25, 'laboratoire', 'Bâtiment B'),
    ('Laboratoire Info 2', 'LAB-2', 25, 'laboratoire', 'Bâtiment B');

INSERT INTO matieres (code, nom, credit, heures_cm, heures_td, heures_tp, type, departement_id)
SELECT 'ALGO101', 'Algorithmique', 4, 30, 30, 30, 'fondamentale', id FROM departements WHERE code = 'INFO'
UNION ALL
SELECT 'BDD201', 'Bases de Données', 3, 20, 20, 20, 'fondamentale', id FROM departements WHERE code = 'INFO'
UNION ALL
SELECT 'WEB301', 'Développement Web', 3, 15, 20, 30, 'fondamentale', id FROM departements WHERE code = 'INFO'
UNION ALL
SELECT 'ANALYSE101', 'Analyse Mathématique', 4, 40, 30, 0, 'fondamentale', id FROM departements WHERE code = 'MATH'
UNION ALL
SELECT 'RESISTANCE', 'Résistance des Matériaux', 3, 20, 20, 20, 'fondamentale', id FROM departements WHERE code = 'GCU';

INSERT INTO equivalences (type, coefficient, description)
VALUES 
    ('CM', 1.5, 'Cours Magistral : coefficient 1,5'),
    ('TD', 1.0, 'Travaux Dirigés : coefficient 1,0'),
    ('TP', 1.0, 'Travaux Pratiques : coefficient 1,0');

INSERT INTO taux_horaires (categorie, type_seance, montant, annee_academique_id)
SELECT 'Permanent', 'CM', 3500, id FROM annees_academiques WHERE actif = TRUE
UNION ALL
SELECT 'Permanent', 'TD', 3500, id FROM annees_academiques WHERE actif = TRUE
UNION ALL
SELECT 'Permanent', 'TP', 3500, id FROM annees_academiques WHERE actif = TRUE
UNION ALL
SELECT 'Vacataire', 'CM', 5000, id FROM annees_academiques WHERE actif = TRUE
UNION ALL
SELECT 'Vacataire', 'TD', 4000, id FROM annees_academiques WHERE actif = TRUE
UNION ALL
SELECT 'Vacataire', 'TP', 4500, id FROM annees_academiques WHERE actif = TRUE;

INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role)
VALUES 
    ('admin@teachersplan.com', '$2a$10$hash_a_remplacer_admin', 'Admin', 'Système', 'admin'),
    ('rh@teachersplan.com', '$2a$10$hash_a_remplacer_rh', 'Niane', 'Mamadou', 'rh'),
    ('prof@teachersplan.com', '$2a$10$hash_a_remplacer_prof', 'Diop', 'Cheikh', 'enseignant');

INSERT INTO enseignants (matricule, utilisateur_id, departement_id, telephone, categorie, grade, statut)
SELECT 'ENS-2024-001', u.id, d.id, '77 123 45 67', 'Permanent', 'Professeur', 'actif'
FROM utilisateurs u, departements d WHERE u.email = 'prof@teachersplan.com' AND d.code = 'INFO';

INSERT INTO parametres_etablissement (nom_etablissement, adresse, telephone, email)
VALUES ('Université Numérique', 'Dakar, Sénégal', '+221 33 800 00 00', 'contact@univ-num.sn');

INSERT INTO parametres_niveaux (niveaux) VALUES ('L1,L2,L3,M1,M2');

INSERT INTO parametres_semestres (nombre_semestres, debut_semestre_1, fin_semestre_1, debut_semestre_2, fin_semestre_2)
VALUES (2, '2024-09-15', '2025-01-31', '2025-02-15', '2025-06-30');

INSERT INTO parametres_alertes (alerte_heures_min, seuil_heures_min, alerte_conflit_salle, alerte_seance_sans_salle, alerte_enseignant_inactif, rappel_validation, delai_rappel_jours)
VALUES (TRUE, 100, TRUE, FALSE, TRUE, TRUE, 7);