* prototype primary witch hunt interface
* json -> mithril form types
    * maybe just use button stack for everything + server side processing of clicks?
        * can the boring ass button stack have classes applied to "mark" a button as selected?
        * can we alternate colors on the buttons so it's clearer that they're buttons? Would that help?
    * login form
* json -> LHS cards
* json -> log messages


* how do witches communicate? Maybe have an input box for each of them to type a short message that shows up on other witches screens live?
    * it's shitty because we need a way to cover for players that are typing. but maybe that's ok

* maybe add a header and collapse button at the top of each section? Then user can hide panes they don't want, which makes mobile nicer
    * probably need an icon to notify that something has changed.

* favicon
* serve cdn shit myself
* fuse.js for search?


* switch to 2 column view? maybe easier to translate to mobile, and more space for log. put player cards under current action cards.
* or maybe I was right before. 1 column, 3 tabs (public, private, action). maybe no need to paginate log then. server can control active tab which helps in person play.
* use a modal for death actions? Use a modal for all (night?) actions?

... what if, there was just the log - no public/private separation, just one
log. And a button in the hero that pops up a modal w/ character info, admin
buttons, etc.  so the down side is people need to read the log during some
actions. Yea, this is probably a bad idea. but if there's a way to make it work
it'd be great.


* emoji reactions on the log? that'd be amazing. could also be the right way to communicate intent among witches w/o text. names in hover on emojis like slack.


so one column was neat. card is a bit of a bitch. not super convincing.
voting on log messages is neat but completely excessive.

next up: two column layout:
    1. search & logs (just a sequence of plain text message-body's) & pagination
        * it'd be cool to have an age indicator (besides game phase) on messages. Live time counter might be distracting. Maybe an icon for 'recent' updates? (either based on physical time, or game phase)
        * village hanging message: who died, how many votes, and everyone else that receieved votes (and how many) - tool tip on each person and number to see who all voted.
        * danger for kills, warning for attempts, info notable stuff (e.g., ability activated), primary for private info, regular or dark for votes
        * add some checkboxes under the search bar to filter to notable categories - role+team info, attempts, kills, others?
    2. Actions. idk how I should do this
        a. a "buttons" for each option to vote on, left button is option, others are reactions - except this will require a ton of work to keep aligned correctly
        b. panels are hot, but how do we signal intent? could use tabs for that, but ugh gross
            * or tap a person multiple times to indicate stronger conviction, but that doesn't indicate "don't kill this person"
            * panel can be colored and selection icon choosen based on action type for fun
            * tabs don't have to be awful - buttons stay the same, tab chooses input type. that might work really well.
            * or switch color based on which tab you're on
        c. table can do it. not the _worst_ idea
       Also need multiple sets of actions - witches have both witch kill and their own actions to perform
        * probably good to put each action in a card - header explains what it's for, and then actions in the card content (but panels solve this nicely already...)

and extras:
    * mod modal: bunch of buttons for actions a mod can do - toggle pause, mod kills, others?
    * rule book: modal w/ search? also each character card
    * switch to nav bar instead of hero

* Maybe it's just time to use tables for the complicated things:
    * Logs fits perfectly into a datatable
        * https://www.datatables.net/
        * https://listjs.com/
        * https://github.com/fiduswriter/Simple-DataTables
        * https://codepen.io/dp_lewis/pen/MwPRYW
        * https://www.npmjs.com/package/sm-table
        * https://github.com/eddyystop/mithril-components/tree/master/components/datatable
    * Reaction voting is also a table - reactions are their own cells so clickable w/ row highlight
        * No stupid tabs
        * Everything inside is just buttons. Moar buttons.


Probably need to limit user names - long words cause table cells to keep growing and fuck with column sizes. 12ish characters is enough?


* fuse.js
    - create an index whenever new logs are received?
    - shouldn't need to look at msg field
    - disable sorting
    - might need to turn threshold down some
    - maybe good to increase distance a bunch



pause button for everyone - should require some threshold of players to activate (or admin), requires unianimous vote to resume (admin has extra button to force resume)

hysteresis on some controls - certainly reaction, but also probably on the users votes

async split on server - game state maintains the log of things to send players,
at the end of any async function updating gamestate call `pump` which finds and
sends new messages to users. `pump` can be restricted to run at most only every
50ms (but always run within 50ms of being called)


dark mode: https://github.com/jgthms/bulma/issues/2342

a lot of stuff is too big on mobile - ideas:
    - make buttons (esp reaction buttons) small - maybe even make names on reaction tables small
    - make all emojis small
    - remove emojis where possible - just bold selected player instead of skull column, remove all extra columns for log messages - user can click and get modal for more info


a minigame should be present at least during eyes closed phases which encourages players to click:
    * trivia is the obvious choice
    * chess or other board games against an AI

consider being a monster and making it so the back button doesn't really work too well. otherwise I know I'm going to click out of the app if anything fullscreen happens...