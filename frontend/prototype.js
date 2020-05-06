var state = {
    personal: [],
    logs: [
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
        {id: 14, msg: "The standard Lorem Ipsum passage, used since the 1500s", cls: "is-link"},
        {id: 15, msg: "test message 5", cls: "is-info"},
        {id: 16, msg: "test message 6", cls: "is-success"},
        {id: 17, msg: "test message 7", cls: "is-warning"},
        {id: 18, msg: `<span data-tooltip="foo,bar,baz">Hello World</span>`, cls: "is-danger"},
    ],
    actions: [],
}

var player_card = function() {
    return m("div", {class: "card"}, [
        m("header", {class: "card-header"}, [
            m("p", {class: "card-header-title"}, "Loose Cannon"),
        ]),
        m("div", {class: "card-content"}, [
            m("div", {class: "content"}, "You can do some stuff!"),
        ]),
        m("footer", {class: "card-footer"}, [
            // TODO: Replace this thing with a button - it will be disabled sometimes
            m("a", {onclick: function() {}, class: "card-footer-item"}, "Fire the cannon!"),
        ]),
    ])
}

var view_log_msg = function(l) {
    return m("article", {class: `message ${l.cls}`}, m("div", {class: "message-body"}, m.trust(l.msg)))
    // TODO: sequence of https://bulma.io/documentation/components/message/#message-body-only
    //       with only message body. Color by privacy/type of info.
    //       use a lighter text color to show day / phase of message
}

var Game = {
    view: function() {
        return [
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
                        m("div", {class: "column"}, [
                            // Actions
                            // Maybe just use a table. we've got 5x inputs per user which become easier. Color is kinda shit on tables.
                            m("nav", {class: "panel is-danger"}, [
                                m("p", {class: "panel-heading"}, [
                                    m("span", "Village Hanging"),
                                    m("span", {class: "is-size-7 is-pulled-right"}, "30 seconds"), // TODO: vertical center
                                ]),
                                m("p", {class: "panel-tabs"}, [
                                    m("a", {class: "is-active"}, "Vote"),
                                    m("a", {class: ""}, "Strong Save"),
                                    m("a", {class: ""}, "Save"),
                                    m("a", {class: ""}, "Kill"),
                                    m("a", {class: ""}, "Strong Kill"),
                                ]),
                                m("a", {class: "panel-block is-active"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    m("span", "James"),
                                    m("span", {class: "tags is-pulled-right"}, [ // FIXME: this does not right align. https://stackoverflow.com/questions/61627784/right-align-text-in-bulma-panel-block
                                        m("span", {class: "tag is-success is-light"}, [ // TODO: remove is-light if I selected this tag for this person
                                            m("span", {class: "icon"}, m("i", {class: "fas fa-shield-alt"})),
                                            m("span", "4"),
                                        ]),
                                        // TODO: add a tag for number of votes this person has right now (and tooltip)
                                        m("div", {"data-tooltip": "user1, user2"}, 
                                            m("span", {class: "tag is-info is-light"}, [
                                                m("span", {class: "icon"}, m("i", {class: "fas fa-skull"})),
                                                m("span", "5"), 
                                            ])
                                        ),
                                    ]),
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    m("span", {class: "is-pulled-right"}, "Mary"),
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    "John",
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    "Patricia",
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    "Robert",
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    "Jennifer",
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    "Michael",
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    "Linda",
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    "William",
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    "Elizabeth",
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    "David",
                                ]),
                                m("a", {class: "panel-block"}, [
                                    m("span", {class: "panel-icon"}, m("i", {class: "fas fa-skull"})),
                                    "Barbara",
                                ]),
                                m("div", {class: "panel-block"},
                                    // TODO: Should this clear all selections, or just selection in the current tab?
                                    m("button", {class: "button is-link is-outlined is-fullwidth"}, "Clear all selections")
                                ),
                            ]),
                        ]),
                        m("div", {class: "column"}, [
                            // Log messages
                            m("div", {class: "field"}, [
                                m("div", {class: "control has-icons-left"}, [
                                    m("input", {class: "input", type: "text", placeholder: "Search"}), // TODO
                                    m("span", {class: "icon is-left"}, m("i", {class: "fas fa-search"})),
                                ]),
                            ]),
                        ], state.logs.map(view_log_msg)),
                        // TODO: don't show all messages, use: https://bulma.io/documentation/components/pagination/

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
