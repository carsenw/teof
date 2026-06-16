# CSC30 Major Project Proposal and Progress

For this project, I plan to create a music-based dodging game using some music I made in the past. The set of twelve songs I made were built around the idea that the musical elements of tempo and pitch are related because they are both just measures of frequency, and how there's only a finite set of unique ones (because doubling or halving a frequency keeps it the same in a way, only changing the octave). Each song is in a different one of the twelve musical keys, and each one has a different tempo (relitavely evenly spaced by frequency in a similar way to how the keys are). I plan to have my game, The Essence of Frequency, reflect the order and simplicity of these patterns. It will likely also work well with my style of creating games, with simple but funcitonal game mechanics and visuals.

The player will be able to explore a main world area, and play levels from portals in the world. The levels will have the player in a capsule that moves around the level area, having to avoid obstacles/attacks for the duration of the level. Each level will be built around a different song.

## Required Features

- [x] Title screen/introduction
- Main world area
    - Player
        - [x] Movement
    - Player interaction features
        - [x] World border wall
        - [x] Other world walls
        - [x] Level portals
            - [x] Level completed indicator
            - [x] Song info
    - [x] Completed levels count
    - [x] Background
    - [x] Pause menu
- Levels
    - Player
        - [x] Movement
    - Level content
        - [x] Music
        - [x] Capsule movement
            - [x] Background animation
        - [x] Obstacles
            - [x] Basic movement
            - [x] Player collision
    - Progress
        - [x] Start transition
        - [x] Progress indicator
        - [x] Level completion
        - [x] Level failing
    - [x] Pause menu
- Game data
    - [x] Prototype world area
    - [x] Prototype levels (1-3 levels, partial songs)

## Desired Features (in bold)

- Title screen/introduction
- Main world area
    - Player
        - Movement
        - [ ] **Smooth player following view**
    - Player interaction features
        - World border wall
        - Other world walls
        - [ ] **Gates (opened with points)**
        - [ ] **Other interacive mechanics**
        - Level portals
            - [ ] **Level progress info (Best score, attempts, etc)**
            - Song info
            - [ ] **Level icons**
            - [ ] **Portal entering animation**
    - [ ] **Level points count**
    - Background
        - [ ] **Changing based on areas/nearby portals**
    - [ ] **Ambient music near portals**
    - Pause menu
        - [ ] **Map**
- Levels
    - Player
        - Movement
    - Level content
        - Music
        - Capsule movement
            - Background animation
            - [x] **View size animation**
            - [ ] **Additional animations**
        - Obstacles
            - Basic movement
            - Player collision
            - [x] **Different obstacle shapes**
            - [x] **Warning and fading**
            - [x] **Boss obstacles**
    - Progress
        - Start transition
        - Progress indicator
        - Level completion
            - [ ] **Different amounts of points (Either for getting further in level or getting hit less)**
            - [ ] **Completion animation**
        - Level failing
            - [ ] **Multiple tries (Lives/Checkpoints)**
            - [ ] **Failing animation**
    - Pause menu
- Game data
    - [ ] **Fninshed world area**
    - [ ] **Finished levels (12 levels, full songs)**