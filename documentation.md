# The Essence of Frequency Documentation

## Proposal for CSC30 Major Project

For this project, I plan to create a music-based dodging game using some music I made in the past. The set of twelve songs I made were built around the idea that the musical elements of tempo and pitch are related because they are both just measures of frequency, and how there's only a finite set of unique ones (because doubling or halving a frequency keeps it the same in a way, only changing the octave). Each song is in a different one of the twelve musical keys, and each one has a different tempo (relitavely evenly spaced by frequency in a similar way to how the keys are). I plan to have my game, The Essence of Frequency, reflect the order and simplicity of these patterns. It will likely also work well with my style of creating games, with simple but funcitonal game mechanics and visuals.

The player will be able to explore a main world area, and play levels from portals in the world. The levels will have the player in a capsule that moves around the level area, having to avoid obstacles/attacks for the duration of the level. Each level will be built around a different song.

## Features List

- [x] Title screen
- [ ] Introduction/opening cutscenes
- Main world area
    - Player
        - [x] Movement
        - [ ] Smooth player following view?
    - Player interaction features
        - [x] World walls
        - [ ] Gates (opened with level points)
        - [ ] World obstacles
        - [ ] Other world features?
        - [x] Level portals
            - [ ] Level progress info
                - [x] Level completed indicator
                - [ ] Best score
            - [x] Song info
            - [ ] Level icons?
            - [ ] Portal entering animation?
    - [x] Level completions/points count
    - [x] Background
        - [ ] Change based on areas/nearby portals?
    - [ ] Ambient music in areas/near portals
    - [x] Pause menu
    - [ ] Map?
- Levels
    - Player
        - [x] Movement
    - Level content
        - [x] Music
        - [x] Capsule movement
            - [x] Background animation
            - [x] View size animation
            - [ ] Additional screen animations?
            - [ ] Different capsule shapes?
        - [x] Obstacles
            - [x] Basic movement
            - [x] Player collision
            - [x] Different obstacle shapes
            - [x] Warning and fading
    - Progress
        - [x] Start animation
        - [x] Progress indicator
        - [ ] Completion animation
        - [ ] Hit counter
        - [x] Level Rewinding
        - [ ] Level Failing
    - [x] Pause menu
- Game data
    - [ ] World area
    - [ ] Levels

## Testing

### Tester 1 (WITH programming experience) - 2026-06-25

- Suggested adjusting the feel of how the player moves in the capsule, maybe having the capsule move slower
- Initially assumed background shapes could be interacted with, so these shapes should be made less prominent
- Found bug where portal "play level" buttons could be clicked from the pause menu, crashing the game
- Found bug where obstacles spawn wrong if a level is reentered

### Tester 2 (WITH programming experience) - 2026-06-07

- Found problem with loading music when starting game, didn't allow game to start
- Discovered that some combinations of key presses cause unexpected movement
- Initially confused if obstacles were to be avoided or not
- Thought it was possible to make more interesting capsule shapes
- Suggested adding escape key to pause

### Tester 3 (WITHOUT programming experience) - 2026-06-07

- Thought world could be a little more interesting

### Tester 4 (WITHOUT programming experience) - 2026-06-07

- Thought player square model is slightly simple
- Said the game has good potential
- Thought boss battle levels would be cool
- Suggested putting more thought into visual detail
- Thought interesting game mechanics could be added