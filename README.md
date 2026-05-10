# PFE E-Commerce — Microservices Spring Boot + Angular

Projet de Fin d'Études (PFE) — Architecture microservices complète.

## Architecture

```
Angular SPA (4200/80)
       │
  API Gateway (:8080)  ← JWT validation, routing, CORS
       │
  ┌────┼────┬─────────┐
  │    │    │         │
user  product  order  Eureka
:8081  :8082  :8083   :8761
  │      │      │
Postgres  Mongo  Postgres
```

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Java 21, Spring Boot 3.3, Spring Cloud 2023 |
| Service Registry | Netflix Eureka |
| API Gateway | Spring Cloud Gateway |
| Auth | JWT (HS256) via user-service |
| BDD relationnelle | PostgreSQL 16 (users, orders) |
| BDD document | MongoDB 7 (catalogue produits) |
| Frontend | Angular 18, Angular Material, Tailwind CSS |
| Containerisation | Docker + Docker Compose |

## Lancement rapide

```bash
# 1. Copier la configuration
cp .env.example .env

# 2. Construire et lancer tous les services
docker compose up --build

# 3. Ouvrir l'application
# Frontend : http://localhost:4200
# Eureka   : http://localhost:8761
# Gateway  : http://localhost:8080
```

## Comptes par défaut

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@pfe.local | admin123 |

*Les comptes utilisateurs sont créés via la page d'inscription.*

## Services

| Service | Port | Description |
|---------|------|-------------|
| discovery-service | 8761 | Eureka — registre de services |
| api-gateway | 8080 | Passerelle — routing, JWT, CORS |
| user-service | 8081 | Utilisateurs, auth (JWT), adresses |
| product-service | 8082 | Catalogue produits (MongoDB) |
| order-service | 8083 | Commandes, historique |
| frontend | 4200 | Application Angular |

## Développement local (sans Docker)

```bash
# Backend : lancer les services dans l'ordre
cd backend/discovery-service && mvn spring-boot:run
cd backend/api-gateway        && mvn spring-boot:run
cd backend/user-service       && mvn spring-boot:run
cd backend/product-service    && mvn spring-boot:run
cd backend/order-service      && mvn spring-boot:run

# Frontend
cd frontend/ecommerce-app
npm install
npm start   # démarre sur http://localhost:4200 avec proxy vers :8080
```

## Choix d'architecture — arguments pour la soutenance

### Pourquoi microservices ?
Séparation des responsabilités : chaque service est déployable, scalable et modifiable indépendamment. L'équipe peut travailler en parallèle sur chaque service.

### Pourquoi Eureka + API Gateway ?
- **Eureka** : découverte automatique des services. Un service peut scaler horizontalement sans reconfiguration manuelle.
- **Gateway** : point d'entrée unique — CORS centralisé, validation JWT, routage. Le frontend n'a qu'une URL à connaître.

### Pourquoi MongoDB pour le catalogue ?
Le schéma des attributs produits varie selon la catégorie (vêtements ≠ électronique). MongoDB offre un schéma flexible sans migrations coûteuses.

### Pourquoi JWT sans serveur de session ?
JWT = stateless. Les services peuvent valider localement sans appel réseau vers une base de sessions. Parfait pour les microservices.

### Panier côté frontend (localStorage)
Choix délibéré pour simplifier l'architecture (pas de cart-service). En production, un Redis-backed cart-service serait ajouté pour la synchronisation multi-device.

### Limites connues (pour la soutenance)
- Appels synchrones entre services (order → product) : en production, Kafka découplerait ces appels.
- Une seule instance PostgreSQL : en production, une instance par service.
- Pas de payment-service : maquette pédagogique, l'intégration Stripe serait une extension naturelle.
