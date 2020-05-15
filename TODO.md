* maybe add a header and collapse button at the top of each section? Then user can hide panes they don't want, which makes mobile nicer
    * probably need an icon to notify that something has changed.

* favicon
* serve cdn shit myself
* noscript tag

* use a modal for death actions? Use a modal for all (night?) actions?

next up: two column layout:
    1. search & logs (just a sequence of plain text message-body's) & pagination
        * it'd be cool to have an age indicator (besides game phase) on messages. Live time counter might be distracting. Maybe an icon for 'recent' updates? (either based on physical time, or game phase)
        * village hanging message: who died, how many votes, and everyone else that receieved votes (and how many) - tool tip on each person and number to see who all voted.
        * danger for kills, warning for attempts, info notable stuff (e.g., ability activated), primary for private info, regular or dark for votes
        * add some checkboxes under the search bar to filter to notable categories - role+team info, attempts, kills, others?
    2. Actions.
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
    * Ok, but mobile gets kinda fucked. How do we make this scale down?
        * maybe make each row a level? it is properly reactive. left can have icon and name grouped together, right can have buttons grouped together, will show as two rows on mobile.
        * maybe a <hr/> between levels?
        * how big is the gap?
        * background highlighting is nice
        * does the text for longer log messages wrap correctly?


Probably need to limit user names - long words cause table cells to keep growing and fuck with column sizes. 12ish characters is enough?


* fuse.js
    - create an index whenever new logs are received?
        - Didn't seem to help much with a few short tags, might help more if we make one big tag per log message
    - shouldn't need to look at msg field
    - might need to turn threshold down some
    - maybe good to increase distance a bunch
    - Searching an array doesn't allow AND'ing multiple searches across the array, just in one tag. We could fix this by jamming all the tags in one string and bumping up the distance a ton
    - Search also gets a bit with too many messages. Need to figure out how many messages to expect, but we might want to put indexing and searching into a webworker
    - And we could make the search box border change color when the computer is thinking!
    - Benchmark the dumb case:
        - tags are all lowercase and white space is removed
        - lower case and split the query string
        - for each log message
            - for each query after split
                - if not found as a substring of a string in tags, remove this log message
        - down side: users have to spell correctly.
        - up side: maybe I don't have to worry about webworkers.
        - based on fuse.js single character search, it'll probably be plenty fast.

pause button for everyone - should require some threshold of players to activate (or admin), requires unianimous vote to resume (admin has extra button to force resume)

zero lag on buttons would be nice - maintain separate local state, only remove it when we get an ack from the server that it has seen the change we put in.

async split on server - game state maintains the log of things to send players,
at the end of any async function updating gamestate call `pump` which finds and
sends new messages to users. `pump` can be restricted to run at most only every
50ms (but always run within 50ms of being called)
    * Yea, this really needs to be done so that we don't have to await each update - they can all be sent with asyncio.wait or w/e
    * esp for login which is very much a special case, it would be nice for everything to return a [(websocket, update)]
    * some of the player state needs to be versioned - notably the actions pane. it can't just be jammed in by the client
    * having a server decided order for the log would be neat, but out of order arrivals there probably don't matter


dark mode: https://github.com/jgthms/bulma/issues/2342

a minigame should be present at least during eyes closed phases which encourages players to click:
    * trivia is the obvious choice
    * chess or other board games against an AI

consider being a monster and making it so the back button doesn't really work too well. otherwise I know I'm going to click out of the app if anything fullscreen happens...

should log messages be updateable by the server? ordering would _suck_, but it would be kinda cool. Maybe stupid. No need for it yet.

currently using the "all" webfont packs. Use something from here to just get
the icons I want, serving multi MB fonts is dumb:
https://github.com/FortAwesome/Font-Awesome/wiki/Customize-Font-Awesome

View specific things can combine multiple streams, notably, buttons that rely on local state until they know the server has seen their message.

How can we handle partial updates to nested data? maybe use https://www.npmjs.com/package/jsonpath ? that's a bit heavy weight for what I need
maybe all object updates should be deep merges like https://github.com/TehShrike/deepmerge ?
it'd be nice if such a solution were deeply integrated with streams so that there's, e.g., a stream for reactions to a given player, and a stream for the local decision, which can be combined for the view

