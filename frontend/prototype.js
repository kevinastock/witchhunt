// FIXME: use m("foo.bar") syntax where possible

var state = {
    login: {
        logged_in: true,

        lobby_msg: "",
        username_msg: "",
        password_msg: "",

        lobby: Cookies.get("lobby"),
        user: Cookies.get("user"),
        password: Cookies.get("password"),
    },

    personal: [],
    logs: [
        // TODO: things to add to log messages:
        //  * phase: "day" or "night" - maybe use real strings so that fuse.js can search them
        //  * day count: int
        //  * a list of people mentioned so fuse can tag search with higher weight
        //  * flag if this is private (would also be a good tag)
        //  * ideally anything could be found, but fuse doesn't have to look at msg
        //  TODO: remove cls
        {id: 1, msg: "test message 1", cls: ""},
        {id: 2, msg: "test message 2", cls: "is-dark"},
        {id: 3, msg: "test message 3", cls: "is-primary"},
        {id: 4, msg: "The standard Lorem Ipsum passage, used since the 1500s", cls: "is-link"},
        {id: 5, msg: "test message 5", cls: "is-info"},
        {id: 6, msg: "test message 6", cls: "is-success"},
        {id: 7, msg: "test message 7", cls: "is-warning"},
        {id: 8, msg: `<span data-tooltip="foo,bar,baz">Hello World</span>`, cls: "is-danger"},
        {id: 9, msg: "test message 1", cls: ""},
        {id: 10, msg: "test message 2", cls: "is-dark"},
        {id: 13, msg: "test message 3", cls: "is-primary"},
        {id: 14, msg: "The standard Lorem Ipsum passage, used since the 1500s asdf awef  asdf awf asdg af awsev wevawesv asdf asfas aewf we asdf asdf aefew  asdf asg ga as vas vase vasev", cls: "is-link"},
        {id: 15, msg: "test message 5", cls: "is-info"},
        {id: 16, msg: "test message 6", cls: "is-success"},
        {id: 17, msg: "test message 7", cls: "is-warning"},
        {id: 18, msg: `<span data-tooltip="foo,bar,baz">Hello World</span>`, cls: "is-danger"},
    ],
    actions: [
        [
            // TODO: this need to have a list of people that have voted for this person
            {selected: true, name: "Kevin", strong_save: ["a", "b", "c"], save: ["d"], kill: ["e"], strong_kill: []},
            {selected: false, name: "Adam", strong_save: ["a"], save: ["d"], kill: ["e"], strong_kill: ["b", "c"]},
        ],
    ],
}

function makeid(length) {
       var result = '';
       var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
       var charactersLength = characters.length;
       for (var i = 0; i < length; i++) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return result;
}

function view_log_msg(l) {
    return m("tr", [
        m("td", m("span.icon", m("i.fas.fa-user-secret"))), // Make sure to always print the span.icon so the space is filled even if no rows are private
        m("td", m.trust(l.msg)),
        m("td.has-text-grey-light", m("span.icon", m("i.fas.fa-moon"))), // also fa-sun for day
        m("td.has-text-grey-light", "4"),
    ])
    // TODO: color for privacy icon?
}

function log_column() {
    return [
        // TODO: don't show all messages, use: https://bulma.io/documentation/components/pagination/
        m(".field", [
            m(".control.has-icons-left", [
                m("input.input[type=text][placeholder=Search]"), // TODO
                m("span.icon.is-left", m("i.fas.fa-search")),
            ]),
        ]),

        m("table.table.log-table.is-hoverable.is-fullwidth",
            m("tbody", state.logs.map(view_log_msg))),

        m("nav.pagination[role=navigation]", [ // TODO
            m("a.pagination-previous[disabled]", "Previous"),
            m("a.pagination-next", "Next"),
            m("ul.pagination-list", [
                m("li.pagination-link", 1),
                m("li.pagination-ellipsis", m.trust("&hellip;")),
                m("li.pagination-link", 8),
                m("li.pagination-link is-current", 9),
                m("li.pagination-link", 10),
                m("li.pagination-ellipsis", m.trust("&hellip;")),
                m("li.pagination-link", 20),
            ]),
        ]),
    ]
}

function reaction(votes, color) {
    var attrs = {}
    attrs["class"] = ""
    if (true) {
        // TODO: don't do this if current user in votes
        attrs["class"] += " is-light"
        // or this: attrs["class"] += " is-outlined"
        // TODO: is yellow for warning ok? kinda unreadable on white, esp w/ outlined
    }
    if (votes.length > 0) {
        attrs["class"] += " " + color
        attrs["data-tooltip"] = votes.join(", ")
    }

    attrs["onclick"] = function(e) {
        console.log("button pushed")
        e.stopPropagation()
    }

    return m("td", m("a.button", attrs, votes.length))
}


function vote_row(candidate) {
    return m("tr", {onclick: function() { console.log("row clicked") }}, [
        // This could show how people have actually voted, but that's kinda bullshit, because people can switch at the last moment
        // and for witch voting, they all share the vote they're casting
        m("td", m("span.icon", candidate.selected ? m("i.fas.fa-skull") : [])), // Make sure to always print the span.icon so the space is filled even if no rows are selected
        m("td", m.trust(candidate.name)), // strong if selected?
        reaction(candidate.strong_save, "is-success"),
        reaction(candidate.save, "is-info"),
        reaction(candidate.kill, "is-warning"),
        reaction(candidate.strong_kill, "is-danger"),
    ])
}

function reaction_voter(actions) {
    return m("table.table.log-table.is-hoverable.is-fullwidth", // if we keep using log-table, rename it.
        m("thead", m("tr", [
            m("th[colspan=2]", "Villager Hanging"),
            // TODO: Rename these to '(Strong|) (Ignore|Select)' so they work for angels too
            m("th.has-text-centered", {"data-tooltip": "Strong save"}, "S+"),
            m("th.has-text-centered", {"data-tooltip": "Save"}, "S"),
            m("th.has-text-centered", {"data-tooltip": "Kill"}, "K"),
            m("th.has-text-centered", {"data-tooltip": "Strong Kill"}, "K+"),
        ])),
        m("tbody", actions.map(vote_row)))
}

function actions_column() {
    return [
        reaction_voter(state.actions[0]),
        // TODO: box of buttons (collapsable?):
        //      - volunteer to die modal
        //      - apprentice selection
        //      - gambler selection
        //      - assassin (button per person)
        //      - bomber detonate
        //      - loose cannon (button per person)
        //      - nurse (button per role)
        //      - peeping tom (button per role)
        //      - spiritualist (button per dead player)
        // TODO: non reaction character selector + modal version
        //      - BoD + modal
        //      - DoB + modal
        //      - Bomber init
        //      - bomb holder selection
        //      - fortune teller (roles not names)
        //      - hunter
        //      - inquisitor
        //      - judge (modal only)
        //      - priest
    ]
}

function header() {
    return m("nav.navbar.is-primary.is-fixed-top[role=navigation]", [
        // TODO: add some notifications here
        // TODO: phase and time remaining, live updates (maybe only every 5/10 seconds)
        // TODO: what settings? how to set?
        // TODO: action button modal with timer on it
        // TODO: pop up with game configuration, including a blurb on what each role does
        m(".container", [
            m(".navbar-brand", [
                m(".navbar-item", m("h1.is-size-3.has-text-weight-bold", "WH")),
                m(".navbar-item", m("span", "30 seconds")),
                m("a.navbar-burger.burger[role=button][data-target=navMenu]", [
                    // FIXME: the burger is busted?
                    m("span"),
                    m("span"),
                    m("span"),
                ]),
            ]),

            m(".navbar-menu#navMenu", [
                m(".navbar-end", [
                    m("a.navbar-item", "Admin"), // TODO
                    m("a.navbar-item", "Rules"), // TODO
                    m("a.navbar-item", "Settings"), // TODO
                ]),
            ]),
        ]),
    ])
}

function footer() {
    return m("footer.footer", [
        // TODO: link to witch hunt proper & github
        m(".content.has-text-centered", m("p", "© 2020 Kevin Stock")),
    ])
}

function game_body() {
    return m("section.section", [
        m(".container", [
            m(".columns", [
                m(".column", actions_column()),
                m(".column", log_column()),
            ]),
        ]),
    ])
}

function login_body() {
    return m("section.section", [
        m(".container", [
            m(".columns", [
                m(".column.is-one-third.is-offset-one-third", [
                    m(".box", [
                        // TODO: need to explain what the "Password" is
                        // TODO: it'd be nice to get the default lobby from a url
                        m(".field.has-addons", [
                            m(".control.has-icons-left.is-expanded", [
                                m("input.input[type=text][placeholder=Lobby]", {
                                    class: state.login.lobby_msg ? "is-danger" : "",
                                    value: state.login.lobby,
                                    onchange: function(e) { state.login.lobby = e.target.value },
                                }),
                                m("span.icon.is-left", m("i.fas.fa-users")),
                                m("p.help.is-danger", m.trust(state.login.lobby_msg)),
                            ]),
                            m(".control", m("a.button.is-primary", {onclick: function() { state.login.lobby = makeid(3) }}, m("span.icon", m("i.fas.fa-dice")))),
                        ]),

                        m(".field", [
                            m(".control.has-icons-left", [
                                m("input.input[type=text][placeholder=Username]", { // TODO: [maxlength=12]
                                    class: state.login.username_msg ? "is-danger" : "",
                                    value: state.login.username,
                                    onchange: function(e) { state.login.username = e.target.value },
                                }),
                                m("span.icon.is-left", m("i.fas.fa-user")),
                                m("p.help.is-danger", m.trust(state.login.username_msg)),
                            ]),
                        ]),

                        m(".field.has-addons", [
                            m(".control.has-icons-left.is-expanded", [
                                m("input.input[type=text][placeholder=Password]", {
                                    class: state.login.password_msg ? "is-danger" : "",
                                    value: state.login.password,
                                    onchange: function(e) { state.login.password = e.target.value },
                                }),
                                m("span.icon.is-left", m("i.fas.fa-lock")),
                                m("p.help.is-danger", m.trust(state.login.password_msg)),
                            ]),
                            m(".control", m("a.button.is-primary", {onclick: function() { state.login.password = makeid(3) }}, m("span.icon", m("i.fas.fa-dice")))),
                        ]),

                        m(".field", [
                            m(".control", [
                                m("button.button.is-fullwidth.is-link[type=submit]", {
                                    // TODO: class: "is-loading",
                                    onclick: function() {
                                        console.log(state.login)
                                    },
                                }, "Connect"),
                            ]),
                        ]),
                    ]),
                ]),
            ]),
        ]),
    ])
}

var Game = {
    view: function() {
        return [
            //login_modal(),
            header(),
            state.login.logged_in ? game_body() : login_body(),
            footer(),
        ]
    }
}

Cookies.set('lobby', 'foobar', {SameSite: "Strict"})
m.mount(document.body, Game)
