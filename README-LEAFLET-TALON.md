# CoachZilla Route Planning & Map Accuracy Guide
## Author: Judah (Your Friendly Neighborhood Code-Man :D)
## Owner: Talon (Elite Sweaty Gamer ;3)
## Support Context
This document defines the route calculation and map-related work still needed in the CoachZilla project. The application architecture has already been refactored to use models, managers, pages, and services. The RoutePlanner system is functional but currently uses simplified mathematical approximations. The next major goal is to improve route accuracy, realism, and map integration.

---

# Project Goal
CoachZilla should evolve from a prototype route system into a more realistic routing engine using:

- accurate geographic distance calculations
- improved heading calculations
- consistent time estimation based on real-world units
- stronger integration with Leaflet map visualization
- scalable route logic for future enhancements

Talon, this document is specifically for your portion of the project.

---

# Current State of the Project

## Already Implemented
The following systems are already working:

- RoutePlanner generates routes and legs
- refuel logic exists and is functional
- bus fuel constraints are considered
- StationManager provides station data
- Leaflet map displays stations and route previews
- Travel page displays route legs and summary data

## Current Limitation
The route system is still based on simplified math and does not reflect real-world geography.

Examples:
- distance uses basic Cartesian math on lat/long values
- heading uses simple angle calculations
- time is derived from simplified distance/speed relationships
- route lines are straight polylines, not real road paths

---

# Your Primary Responsibilities

## 1. Replace Distance Calculation with Real Geographic Formula

### Current behavior
Distance is calculated using:
- '''javascript
- Math.sqrt(dx * dx + dy * dy)
- This treats latitude/longitude as flat coordinates.

### Required Upgrade
- Replace with a real-world distance formula such as:
- Haversine formula (recommended baseline)
- OR a map-based routing API (advanced)

### Expected outcome
- distances reflect real geographic scale
- route planning becomes more realistic
- refuel logic becomes more accurate

## 2. Improve Heading Calculation

### Current behavior
Heading uses basic angle math:
- Math.atan2(...)

### Required upgrade
- verify heading aligns with geographic direction
- ensure compatibility with map rendering
- adjust if needed for curved or multi-leg routes

## 3. Normalize Distance, Speed, and Time Units

### Current issue
Units are inconsistent:
- distance is arbitrary (coordinate space)
- speed is assumed real-world
- time is derived from mismatched units

### Required outcome
Ensure:
- distance is in kilometers or miles
- speed matches same unit system
- time calculation is accurate
Example:
- time = distance (km) / speed (km/h)

## 4. Improve Refuel Logic Accuracy

### Current behavior
- Refuel logic works but depends on approximate distance.

### Required upgrade
- use improved distance calculations
- ensure fuel range reflects real-world scale
- validate that refuel stations are logically placed

### Expected result
- route planner chooses realistic refuel stops
- edge cases (long routes) behave correctly

## 5. Enhance Map Integration (Leaflet)

### Current behavior
- stations are displayed as markers
- route preview is a simple polyline

### Required improvements
Visual clarity
- distinguish:
    - start (green)
    - stops (blue)
    - end (red)
    - refuel stops (special icon)
- Route display
    - improve polyline rendering
    - update dynamically when route changes
- Optional (advanced)
    - integrate real routing via Leaflet plugins or APIs
    - snap route to roads instead of straight lines

## 6. Prepare RoutePlanner for Future Expansion
Goal
- Make RoutePlanner flexible for future features such as:
    - multi-route comparison
    - optimized routing (shortest vs fastest)
    - traffic-aware routing (future)
    - dynamic rerouting
- Suggested improvements
    - keep functions modular
    - avoid hardcoding assumptions
    - clearly separate:
        - calculation logic
        - data handling
        - map-related logic

# Important Architecture Notes

## Keep RoutePlanner as the core engine
- RoutePlanner should remain the central system for:
    - route construction
    - leg generation
    - refuel decision-making

## Do not move logic into pages
Avoid putting calculation logic into:
- searchPage.js
- travelPage.js
Keep logic centralized in RoutePlanner.

## Coordinate with LeafletMapService
Map rendering should:
- consume RoutePlanner output
- not duplicate route logic

# Recommended Work Order

## Phase 1 - Distance Upgrade
- implement Haversine formula
- validate output values
## Phase 2 - Unit Normalization
- standardize distance units
- adjust speed/time calculations
## Phase 3 - Refuel Logic Adjustment
- re-test refuel behavior with new distances
- fix edge cases
## Phase 4 - Map Visualization Improvements
- improve marker styles
- improve route line rendering
## Phase 5 - Optional Enhancements
- curved routing
- API-based routing
- route optimization features

# Known Compatibility Concerns
## 1. Existing route data
Travel plans already store:
- legs
- totalDistance
- totalTime

### Changes must not break:
- travel page rendering
- admin plan previews

## 2. Manager compatibility
RoutePlanner feeds into:
- TravelPlanManager
- searchPage.js
- travelPage.js
Avoid breaking expected route structure.

## 3. Refuel station detection
Stations use:
- stationType (bus station)
- fuelType (refuel station)
Ensure logic still distinguishes these correctly.

# Suggested Implementation Philosophy

## Improve accuracy without breaking flow
The app is already functional. Focus on improving realism without breaking working systems.

## Upgrade in layers
Do not change everything at once.

## Best approach:
- upgrade distance first
- verify routes still work
- then improve other calculations

# Files Most Relevant to You

## Core logic
- js/managers/RoutePlanner.js
## Map integration
- js/services/LeafletMapService.js
## Related data
- js/models/Route.js
- js/models/Leg.js
## Pages affected
- js/pages/searchPage.js
- js/pages/travelPage.js

# Definition of "Done" for You
Your route/planning task is complete when:
- distance calculations reflect real-world geography
- time calculations are consistent and accurate (X:XX:XX)
- refuel logic behaves correctly with new distances
- routes render clearly on the map
- start/stop/end are visually distinct
- no existing functionality is broken
- route data remains compatible with travel page and admin page

# Coordination Notes
## Judah
Responsible for:
- overall project integration
- UI/UX refinement
- final testing and cleanup

## Talon
Responsible for:
- route calculation accuracy
- map-based improvements
- math/logic upgrades

## Sean
Responsible for:
- Firebase integration
- authentication
- database persistence

## Final Guidance
Focus on improving accuracy without disrupting the existing system flow. The RoutePlanner and map features are already functional, so your goal is to enhance realism (distance, time, and visualization) while keeping all outputs compatible with the current managers and pages. Work incrementally—validate each change (especially distance and refuel logic) before moving on. Prioritize clean, modular updates so future improvements can build on your work without requiring major rewrites.

# Good luck buddy. o7

# New Tasks (4/15/26)
Add parameters/limiters to the "Add Buses" and "Add Stations" forms so that the calculations remain realistic.

# New Tasks (4/20/26)
- Fix the math calculations for time to match this scheme (XX:YY) where XX is the number of hours, and YY is the number of minutes (bearing in mind that minutes cannot excede 60).

- Add functionality to the calculation that checks if a refuel is needed, and prevent a travel plan from being made until a refuel station is selected on that route. Once that's done, the calculation should continue as normal. (or just add prompt if its already there lol)

- Make sure the when the caluclation happens that it's pulling from the specific travel plan, not a large array of numbers. (i.e. make sure the calculation is being done on the current travel plan, not a random travel plan in the database)