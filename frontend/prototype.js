// FIXME: use m("foo.bar") syntax where possible

var state = {
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

function view_log_msg(l) {
    return m("tr", [
        m("td", m("span", {class: "icon"}, m("i", {class: "fas fa-user-secret"}))), // Make sure to always print the span.icon so the space is filled even if no rows are private
        m("td", m.trust(l.msg)),
        m("td", {class: "has-text-grey-light"}, m("span", {class: "icon"}, m("i", {class: "fas fa-moon"}))), // also fa-sun for day
        m("td", {class: "has-text-grey-light"}, "4"),
    ])
    // TODO: color for privacy icon?
}

function log_column() {
    return [
        // TODO: don't show all messages, use: https://bulma.io/documentation/components/pagination/
        m("div", {class: "field"}, [
            m("div", {class: "control has-icons-left"}, [
                m("input", {class: "input", type: "text", placeholder: "Search"}), // TODO
                m("span", {class: "icon is-left"}, m("i", {class: "fas fa-search"})),
            ]),
        ]),

        m("table", {class: "table log-table is-hoverable is-fullwidth"},
            m("tbody", state.logs.map(view_log_msg))),

        m("nav", {class: "pagination", role: "navigation"}, [
            m("a", {class: "pagination-previous"}, "Previous"),
            m("a", {class: "pagination-next"}, "Next"),
            m("ul", {class: "pagination-list"}, [
                m("li", {class: "pagination-link"}, 1),
                m("li", {class: "pagination-ellipsis"}, m.trust("&hellip;")),
                m("li", {class: "pagination-link"}, 8),
                m("li", {class: "pagination-link is-current"}, 9),
                m("li", {class: "pagination-link"}, 10),
                m("li", {class: "pagination-ellipsis"}, m.trust("&hellip;")),
                m("li", {class: "pagination-link"}, 20),
            ]),
        ]),
    ]
}

function reaction(votes, color) {
    var attrs = {}
    attrs["class"] = "button"
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

    return m("td", m("a", attrs, votes.length))
}


function vote_row(candidate) {
    return m("tr", {onclick: function() { console.log("row clicked") }}, [
        // This could show how people have actually voted, but that's kinda bullshit, because people can switch at the last moment
        // and for witch voting, they all share the vote they're casting
        m("td", m("span", {class: "icon"}, candidate.selected ? m("i", {class: "fas fa-skull"}) : [])), // Make sure to always print the span.icon so the space is filled even if no rows are selected
        m("td", m.trust(candidate.name)), // strong if selected?
        reaction(candidate.strong_save, "is-success"),
        reaction(candidate.save, "is-info"),
        reaction(candidate.kill, "is-warning"),
        reaction(candidate.strong_kill, "is-danger"),
    ])
}

function reaction_voter(actions) {
    return m("table", {class: "table log-table is-hoverable is-fullwidth"}, // if we keep using log-table, rename it.
        m("thead", m("tr", [
            m("th", {colspan: "2"}, "Villager Hanging"),
            m("th", {class: "has-text-centered", "data-tooltip": "Strong save"}, "S+"),
            m("th", {class: "has-text-centered", "data-tooltip": "Save"}, "S"),
            m("th", {class: "has-text-centered", "data-tooltip": "Kill"}, "K"),
            m("th", {class: "has-text-centered", "data-tooltip": "Strong Kill"}, "K+"),
        ])),
        m("tbody", actions.map(vote_row)))
}

function login_box() {
    return m(".box", [
        // TODO: set value to whatever is in their cookie
        // TODO: gonna need some oninput's on these, on obv onclick on buttons when not disabled
        // TODO: If going to use placeholders, add icons next to each field so it's clear (fa-users, fa-user, fa-key)
        // TODO: If not using placeholders + icons, add before control div: m("label", {class: "label"}, "..."),
        // TODO: need to explain what the "Password" is
        m("div.field", [
            m("div.control", [
                m("input.input", {type: "text", placeholder: "Lobby"}),
                m("p.help.is-danger", m.trust("&nbsp;")),
            ]),
        ]),
        m("div.field", [
            m("div.control", [
                m("input.input", {class: "is-danger", type: "text", placeholder: "Username"}),
                m("p.help.is-danger", "Foo Bar"),
            ]),
        ]),
        m("div.field", [
            m("div.control", [
                m("input.input", {type: "text", placeholder: "Password"}),
                m("p.help.is-danger", {class: "is-danger"}, m.trust("&nbsp;")),
            ]),
        ]),
        m("div.field", [
            m("div.control", [
                m("button.button.is-fullwidth.is-link", {disabled: true, type: "submit"}, "Connect"),
            ]),
        ]),
        m("div.field", [
            m("div.control", [
                m("button.button.is-fullwidth.is-link", {/*class: "is-loading",*/ type: "submit"}, "Create lobby"),
            ]),
        ]),
    ])
}

function login_modal() {
    // TODO: need to add is-clipped to body when showing modals
    return m(".modal.is-active", [
        m(".modal-background"),
        m(".modal-content", login_box()),
    ])
}

function actions_column() {
    return [
        //m("div", {class: "container has-background-primary"}, m("h1", {class: "title"}, "Hello")),
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


var Game = {
    view: function() {
        return [
            //login_modal(),
            // Header
            m("nav", {class: "navbar is-primary is-fixed-top", role: "navigation"}, [
                // TODO: add some notifications here
                // TODO: phase and time remaining, live updates (maybe only every 5/10 seconds)
                // TODO: what settings? how to set?
                // TODO: action button modal with timer on it
                m("div", {class: "container"}, [
                    m("div", {class: "navbar-brand"}, [
                        m("div", {class: "navbar-item"}, m("h1", {class: "is-size-3 has-text-weight-bold"}, "WH")),
                        m("div", {class: "navbar-item"}, m("span", "30 seconds")),
                        m("a", {role: "button", class: "navbar-burger burger", "data-target": "navMenu"}, [
                            m("span"),
                            m("span"),
                            m("span"),
                        ]),
                    ]),

                    m("div", {id: "navMenu", class: "navbar-menu"}, [
                        /*
                        m("div", {class: "navbar-start"}, [
                        ]),
                        */

                        m("div", {class: "navbar-end"}, [
                            m("a", {class: "navbar-item"}, "Admin"), // TODO
                            m("a", {class: "navbar-item"}, "Rules"), // TODO
                            m("a", {class: "navbar-item"}, "Settings"), // TODO
                        ]),
                    ]),
                ]),
            ]),

            // Body
            m("section", {class: "section"}, [
                m("div", {class: "container"}, [
                    m("div", {class: "columns"}, [
                        m("div", {class: "column"}, actions_column()),
                        m("div", {class: "column"}, log_column()),
                    ]),
                ]),
            ]),

            // Footer
            m("footer", {class: "footer"}, [
                // TODO: link to witch hunt proper & github
                m("div", {class: "content has-text-centered"}, m("p", "© 2020 Kevin Stock")),
            ]),
        ]
    }
}

m.mount(document.body, Game)
