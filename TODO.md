Priority things to do:

    * create the reaction voter on the server
    * have configuration send a reaction voter for role selection
    * front end handling of reaction voter


* maybe add a header and collapse button at the top of each section? Then user can hide panes they don't want, which makes mobile nicer
    * probably need an icon to notify that something has changed.

* favicon

* use a modal for death actions? Use a modal for all (night?) actions?

* it'd be cool to have an age indicator (besides game phase) on messages. Live time counter might be distracting. Maybe an icon for 'recent' updates? (either based on physical time, or game phase)
* village hanging message: who died, how many votes, and everyone else that receieved votes (and how many) - tool tip on each person and number to see who all voted.

and extras:
    * mod modal: bunch of buttons for actions a mod can do - toggle pause, mod kills, others?
    * rule book: modal w/ search? also each character card
    * switch to nav bar instead of hero

* Tables on mobile gets kinda fucked. How do we make this scale down?
    * maybe make each row a level? it is properly reactive. left can have icon and name grouped together, right can have buttons grouped together, will show as two rows on mobile.
        * This works but requires a some custom css to get the margins/padding to look sane, divs between rows, highlighting and I have no idea how to style the name and skull
    * does the text for longer log messages wrap correctly?

Probably need to limit user names - long words cause table cells to keep growing and fuck with column sizes. 12ish characters is enough?

* fuse.js
    - might need to turn threshold down some
    - maybe good to increase distance a bunch
    - Searching an array doesn't allow AND'ing multiple searches across the
      array, just in one tag. We could fix this by jamming all the tags in one
      string and bumping up the distance a ton
    - there's a better way to do search: there are a limited number of tags
      (role, people, when, visibility, action, etc). Parse the query (split on
      &, |, parens, quotes (for exact)) ourselves, and collect all unique tags
      into a set. Then for each search term in the query, run fuse.js on the
      set of all tags and return the highest ranked tag. Then filter the full
      set of log messages to the exact matches of those returned tags with the
      boolean expressions applied.

pause button for everyone - should require some threshold of players to activate (or admin), requires unianimous vote to resume (admin has extra button to force resume)

zero lag on buttons would be nice - maintain separate local state, only remove it when we get an ack from the server that it has seen the change we put in.
View specific things can combine multiple streams, notably, buttons that rely on local state until they know the server has seen their message.

dark mode: https://github.com/jgthms/bulma/issues/2342

a minigame should be present at least during eyes closed phases which encourages players to click:
    * trivia is the obvious choice
    * chess or other board games against an AI

consider being a monster and making it so the back button doesn't really work too well. otherwise I know I'm going to click out of the app if anything fullscreen happens...
    * or, the game should reload super quickly. that would be the right thing.
    * auto login in some cases would be good. maybe use routes - top level is always login, but anything else assumes that's the lobby name and tries to auto login if cookies are present

currently using the "all" webfont packs. Use something from here to just get
the icons I want, serving multi MB fonts is dumb:
https://github.com/FortAwesome/Font-Awesome/wiki/Customize-Font-Awesome

How can we handle partial updates to nested data? maybe use https://www.npmjs.com/package/jsonpath ? that's a bit heavy weight for what I need
maybe all object updates should be deep merges like https://github.com/TehShrike/deepmerge ?
it'd be nice if such a solution were deeply integrated with streams so that there's, e.g., a stream for reactions to a given player, and a stream for the local decision, which can be combined for the view
    - Using the buttons & components setup, we can have the component (a nested structure) defined once when it's created, mutable parts of it are all stored in a flat set of items that are each versioned and referenced by the component

Once we're past login, I think everything is `n Choose r` or one click action.
If everything can be structured this way, the client could pretty easily
simulate the server and keep lag from being visible.
