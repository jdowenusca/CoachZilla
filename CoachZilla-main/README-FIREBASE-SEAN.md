# CoachZilla Firebase Integration Guide
## Author: Judah (Your Friendly Neighborhood Code-Man :D)
## Owner: Sean (Firebase EXPERT ;3)
## Support Context
This document defines the Firebase-related work still needed in the CoachZilla project. The application architecture has already been refactored to use models, managers, pages, and services. Current functionality works primarily through localStorage and manager-driven app state. The next major goal is to replace prototype storage and auth flows with real Firebase functionality.

---

# Project Goal
CoachZilla should move from a browser-only prototype into a Firebase-backed application using:

- Firebase Authentication
- Cloud Firestore
- manager/service-driven data access
- per-user travel plan persistence
- shared station and bus data persistence

Sean, this document is specifically for your portion of the project.

---

# Current State of the Project

## Already Implemented
The following systems are already in place and working in local/prototype form:

- RoutePlanner logic with route/refuel behavior
- StationManager integration with search page
- Leaflet map integration on search page
- Travel page rendering with route legs and selected stops
- Admin edit/delete functionality for buses and stations
- Admin dashboard improvements
- Manager-based project structure

## Current Limitation
The project still uses localStorage as the main persistence layer. Firebase service files exist but are still stubs/placeholders.

Examples:
- user login state is still stored in localStorage
- stations, buses, and travel plans are still persisted with localStorage
- FirestoreService currently behaves like a local wrapper rather than a real Firestore connector
- FirebaseAuthService is not yet performing real authentication

---

# Your Primary Responsibilities

## 1. Firebase Authentication
Replace local prototype login behavior with real Firebase Authentication.

### Required outcomes
- users can sign in with Firebase Auth
- users remain logged in using Firebase session persistence
- authenticated user identity is based on Firebase UID
- admin vs regular user role flow still works
- page protection uses authenticated session data rather than only localStorage

### Important note
The current app still expects a user object with properties like:
- userID
- username
- firstName
- lastName
- role

You should decide whether:
- Firebase Auth user profile fields will be mapped into the existing structure
- or a Firestore user document will store extra profile data keyed by UID

---

## 2. Firestore Integration
Replace localStorage persistence with Cloud Firestore persistence.

### Required outcomes
Firestore should store and retrieve:

- users
- buses
- stations
- travel plans

### Target direction
The page layer should not talk directly to Firestore.
Pages should continue to use managers/services.

Preferred flow:
Page -> Manager -> FirestoreService -> Firebase

---

## 3. Firestore Data Design
You should define and implement a clean Firestore schema for the following collections.

### Recommended collections

#### users
Stores profile and role info.
Suggested fields:
- uid
- username
- firstName
- lastName
- role
- createdAt
- updatedAt

#### buses
Stores all buses available in the system.
Suggested fields:
- id
- make
- model
- type
- fuelType
- fuelTankSize
- fuelBurnRate
- cruiseSpeed
- createdAt
- updatedAt

#### stations
Stores both bus stations and refuel stations.
Suggested fields:
- id
- name
- latitude
- longitude
- stationCategory ("bus" or "refuel")
- stationType (for bus stations only)
- fuelType (for refuel stations only)
- createdAt
- updatedAt

#### travelPlans
Stores user-created travel plans.
Suggested fields:
- travelPlanId
- userId
- selectedBusId
- destinations
- route
- status
- createdAt
- updatedAt

---

# Important Architecture Notes

## Keep existing manager pattern
The project has already been structured around managers:
- BusManager
- StationManager
- TravelPlanManager
- RoutePlanner

Try to preserve that architecture, and if changes need to be made be sure to document them.

### Good pattern
Managers call FirestoreService internally.

### Avoid
Page files directly calling Firebase SDK everywhere.

---

## Minimize UI rewrites
The current pages are already working:
- search.html / searchPage.js
- travel.html / travelPage.js
- admin.html / adminPage.js
- edit.html / editPage.js

Try to swap out storage/auth logic without rewriting page behavior unless necessary.

---

# Recommended Work Order

## Phase 1 - Firebase Setup
- configure Firebase project
- add Firebase SDK config to project
- initialize Firebase app
- initialize Auth
- initialize Firestore

## Phase 2 - Authentication
- implement FirebaseAuthService
- replace local login/session storage
- ensure current user is loaded on page refresh
- protect admin-only pages
- preserve logout behavior

## Phase 3 - FirestoreService
- implement real Firestore CRUD methods
- add collection helpers for users, buses, stations, and travel plans
- normalize read/write shapes to match current managers/models

## Phase 4 - Manager Refactor
Update managers so they can use FirestoreService instead of localStorage.
Priority order:
1. StationManager
2. BusManager
3. TravelPlanManager
4. any remaining user/profile helpers

## Phase 5 - Page Integration Cleanup
Update page logic only where necessary so:
- current user comes from Firebase session/service
- active plans can be loaded from Firestore
- CRUD changes persist across sessions/devices

---

# Known Compatibility Concerns

## 1. ID consistency
Some parts of the project compare IDs as strings.
Normalize ID comparisons consistently.
Recommendation:
- always cast IDs to strings when comparing
- keep Firebase UID as string
- preserve manager compatibility where possible

## 2. Route object storage
Travel plans currently store route data including:
- legs
- totalDistance
- totalTime
- refuelStops

Confirm that route objects serialize cleanly into Firestore.
If needed, convert model instances into plain objects before saving.

## 3. Current user shape
Some pages still read:
- currentUser from localStorage
- activeTravelPlanId from localStorage

These should eventually move to:
- Firebase-authenticated current user
- Firestore-based plan retrieval

## 4. Admin role handling
Firebase Auth alone will not provide role information.
You likely need:
- a Firestore user profile document
- or a role field associated with the user document

---

# Suggested Implementation Philosophy

## Keep the current working UI
The app already works well enough in prototype form. Firebase integration should replace the storage/auth backbone, not force unnecessary UI rewrites.

## One layer at a time
Do not change:
- auth
- Firestore
- managers
- page logic

all at once unless absolutely necessary.

Best practice:
- get Auth working
- get FirestoreService working
- migrate one manager at a time
- then update the pages that depend on them

---

# Files Most Relevant to You

## Services
- js/services/FirebaseAuthService.js
- js/services/FirestoreService.js

## App bootstrap
- js/app/app.js

## Managers
- js/managers/BusManager.js
- js/managers/StationManager.js
- js/managers/TravelPlanManager.js

## Pages likely needing updates
- js/pages/indexPage.js
- js/pages/createPage.js
- js/pages/mainPage.js
- js/pages/adminPage.js
- js/pages/editPage.js
- js/pages/searchPage.js
- js/pages/travelPage.js

---

# Definition of "Done" for You

Your Firebase task can be considered complete when:

- users can register/login through Firebase Authentication
- authenticated session persists correctly
- buses/stations/travel plans are saved in Firestore
- managers retrieve real Firestore data
- page reloads no longer depend on localStorage for core data
- admin and user workflows still function
- the rest of the team can test the app on multiple sessions/devices with persistent data

---

# Coordination Notes

## Judah
I am resonsible for compilation of the project files, rerouting code and filepaths to ensure baseline functionality, and, at the end of both of your tasks, refinding the overall UI/UX to ensure clean user-friendly functionality.
- code refining and filepath sorting
- testing functionality and revision of core elements
- UI/UX implementation and cleanup

## Talon
Talon is responsible for future route/map calculation upgrades:
- real geographic distance calculation
- route accuracy improvements
- heading/time consistency improvements

## Sean
You are responsible for backend/data/auth integration:
- Firebase setup
- Firebase auth
- Firestore persistence
- manager service integration

---

# Final Guidance
Do not rebuild the app structure unless it cannot be avoided. The structure is already in a good place, but if need be we can change it.
The main goal is to replace prototype persistence/auth layers with Firebase while preserving the manager-based architecture.

# Good luck mate. o7