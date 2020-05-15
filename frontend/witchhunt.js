var Cookies = require("js-cookie");
var m = require("mithril");
var Stream = require("mithril/stream");


var updates = Stream();

var state = {
    // is_admin: false, // TODO: is this even needed on the client?
    actions: [
        [
            // TODO: this need to have a list of people that have voted for this person
            {
                selected: true,
                name: "Kevin",
                strong_save: ["a", "b", "c"],
                save: ["d"],
                kill: ["e"],
                strong_kill: []
            }, {
                selected: false,
                name: "Adam",
                strong_save: ["a"],
                save: ["d"],
                kill: ["e"],
                strong_kill: ["b", "c"]
            },
        ],
    ],
};

function update_clobber(accumulator, update) {
    let name = accumulator.name;
    if (name in update) {
        return {
            name: name,
            value: update[name]
        };
    }
    return Stream.SKIP;
}

function update_append(accumulator, update) {
    let name = accumulator.name;
    if (name in update) {
        accumulator.value.push(...update[name]);
        accumulator.value.sort(function(a, b) {
            return a.id - b.id;
        });
        return accumulator;
    }
    return Stream.SKIP;
}

function add_state_field(name, init, update_strategy) {
    // TODO: map updates to only accept those with name as a key, then individuals can forget their own name
    // maybe even move everything out of the state object?
    state[name] = Stream.scan(update_strategy, {
        name: name,
        value: init
    }, updates).map(x => x.value);
    return state[name];
}

// logged_in is false when not logged in, and an object of
// lobby,username,password once successfully connected to a lobby
add_state_field("logged_in", false, update_clobber).map(function(login) {
    if (login) {
        // If we've gotten a successful login, set the cookies.
        Cookies.set('lobby', login.lobby, {
            SameSite: "Strict"
        });
        Cookies.set('username', login.username, {
            SameSite: "Strict"
        });
        Cookies.set('password', login.password, {
            SameSite: "Strict"
        });
    }
    return login;
});

// Error messages to show on a failed login attempt
add_state_field("login_messages", {
    lobby: "",
    username: "",
    password: "",
}, update_clobber);


add_state_field("logs", [], update_append);

// FIXME delete this shit.
let stupid_test_data = [];
for (var i = 0; i < 5000; i++) {
    // TODO: things to add to log messages:
    //  * a list of people mentioned so fuse can tag search with higher weight
    //  * flag if this is private (would also be a good tag)
    //  * ideally anything could be found, but fuse doesn't have to look at msg
    //  msg: `<span data-tooltip="foo,bar,baz">Hello World</span>`,
    let tod = ["day", "night"][Math.floor(Math.random() * 2)];
    let foobar = makeid(3);
    let secret = Math.random() >= 0.5;
    let tags = [tod, foobar];
    if (secret) {
        tags.push("secret");
    } else {
        tags.push("public");
    }

    stupid_test_data.push({
        id: i,
        msg: '<span data-tooltip="Hello Kevin">' + foobar + '</span>',
        secret: secret,
        time_of_day: tod,
        day: i,
        tags: tags,
    });
}
updates({
    "logs": stupid_test_data,
});
// end of garbage test code

// Stuff that the server will never update
var local_state = {
    // The local state of the form fields for logging in
    login_form: {
        lobby: Cookies.get("lobby"),
        username: Cookies.get("username"),
        password: Cookies.get("password"),
    },

    log_offset: 0,
    log_page_size: 10, // FIXME: save/restore this from a cookie

    log_search_query: Stream(''),

    searcher: new Worker('searcher.js'),
    search_id: 0,
    next_search_id: 1,
    log_search_result: Stream([]),
};

local_state.searcher.onmessage = function(e) {
    let version = e.data[0];
    let logs = e.data[1];

    if (version < local_state.search_id) {
        return;
    }

    local_state.search_id = version;
    local_state.log_search_result(logs);
    local_state.log_offset = 0;
    m.redraw();
};

var terminal_search_dispatcher = Stream.lift(function(logs, query) {
    local_state.log_offset = 0;
    if (query.length === 0) {
        local_state.search_id = local_state.next_search_id++;
        local_state.log_search_result(logs);
        m.redraw(); // I'm not sure if this is needed - we might reach here before the oninput function finishes. but it's harmless
        return Stream.SKIP;
    }

    local_state.searcher.postMessage([logs, query, local_state.next_search_id++]);
    return Stream.SKIP;
}, state.logs, local_state.log_search_query);

var ws = new WebSocket("ws://127.0.0.1:6789/"); // TODO: wss

ws.onmessage = function(e) {
    let data = JSON.parse(e.data);

    // FIXME: debugging
    console.log(data);

    updates(data);

    // FIXME: it would be good to log state here for debugging, but need to show actual values not stream objects

    /* FIXME: add update_strategy's for these
    // append
    // versioned
    for (let key in data.versioned) {
        if (data.versioned[key].version > state[key].version) {
            state[key] = data.versioned[key];
        }
    }
    */


    m.redraw();
};

ws.onclose = function(e) {
    // This is also closed if the connection can't be established, so that's good
    // FIXME: notify the user that they're disconnected
    m.redraw();
};

function send(action, data) {
    ws.send(JSON.stringify({
        action: action,
        data: data,
    }));
}

// FIXME: do some heartbeating like https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
// change navbar to is-danger if heartbeat expires
// if connection closes, put up a modal?

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
    var time_of_day_icon;
    switch (l.time_of_day) {
        case "day":
            time_of_day_icon = m("i.fas.fa-sun");
            break;
        case "night":
            time_of_day_icon = m("i.fas.fa-moon");
            break;
        default:
            time_of_day_icon = m("i.fas.fa-question");
            break;
    }

    return m("tr", {
        key: l.id
    }, [
        m("td", m("span.icon.is-small", l.secret ? m("i.fas.fa-user-secret") : null)), // Make sure to always print the span.icon so the space is filled even if no rows are private
        m("td", m.trust(l.msg)),
        m("td.has-text-grey-light", m("span.icon", time_of_day_icon)),
        m("td.has-text-grey-light", l.day),
    ]);
    // TODO: color for privacy icon?
}

function log_rows_page(all_rows) {
    return all_rows.slice(Math.max(0, all_rows.length - local_state.log_offset - local_state.log_page_size), all_rows.length - local_state.log_offset).reverse().map(view_log_msg);
}

function paginator_button(idx) {
    return m("li.pagination-link", {
        onclick: function() {
            local_state.log_offset = local_state.log_page_size * (idx - 1);
        }
    }, idx);
}

function paginator(row_count) {
    let current_page = Math.floor(local_state.log_offset / local_state.log_page_size) + 1;
    let pages = Math.ceil(row_count / local_state.log_page_size);

    let neighbors = 1; // How many neighbors to show on each side.
    let items = [];

    if (current_page - neighbors > 1) {
        items.push(paginator_button(1));
    }

    if (current_page - neighbors > 2) {
        items.push(m("li.pagination-ellipsis", m.trust("&hellip;")));
    }

    for (let i = Math.max(1, current_page - neighbors); i <= Math.min(pages, current_page + neighbors); i++) {
        if (i === current_page) {
            items.push(m("li.pagination-link.is-current", i));
        } else {
            items.push(paginator_button(i));
        }
    }

    if (current_page + neighbors < pages - 1) {
        items.push(m("li.pagination-ellipsis", m.trust("&hellip;")));
    }

    if (current_page + neighbors < pages) {
        items.push(paginator_button(pages));
    }

    let prev_button_attrs = {
        disabled: true
    };
    if (current_page !== 1) {
        prev_button_attrs = {
            onclick: function() {
                local_state.log_offset = local_state.log_page_size * (current_page - 1 - 1);
            }
        };
    }
    let next_button_attrs = {
        disabled: true
    };
    if (current_page !== pages && pages !== 0) {
        next_button_attrs = {
            onclick: function() {
                local_state.log_offset = local_state.log_page_size * (current_page + 1 - 1);
            }
        };
    }

    return m("nav.pagination[role=navigation]", [ // TODO
        m("a.pagination-previous", prev_button_attrs, "Previous"),
        m("a.pagination-next", next_button_attrs, "Next"),
        m("ul.pagination-list", items),
    ]);
}

function log_column() {
    // TODO: we could filter messages with fuse here on every render, but that's pretty brutal. should really only refilter when we get a new message or the search changes
    return [
        // TODO: don't show all messages, use: https://bulma.io/documentation/components/pagination/
        m(".field", [
            m(".control.has-icons-left", [
                m("input.input[type=text][placeholder=Search]", {
                    class: local_state.search_id + 1 < local_state.next_search_id ? "is-danger" : "",
                    oninput: function(e) {
                        local_state.log_search_query(e.target.value);
                    },
                }),
                m("span.icon.is-left", m("i.fas.fa-search")),
            ]),
            // TODO: if there's text here, add an X on the right to clear it
        ]),

        m("table.table.log-table.is-hoverable.is-fullwidth",
            // FIXME: need to traverse the list backwards
            m("tbody", log_rows_page(local_state.log_search_result()))),

        paginator(local_state.log_search_result().length),
    ];
}

function reaction(votes, color) {
    var attrs = {};
    attrs["class"] = "";
    if (true) {
        // TODO: don't do this if current user in votes
        attrs["class"] += " is-light";
        // or this: attrs["class"] += " is-outlined"
        // TODO: is yellow for warning ok? kinda unreadable on white, esp w/ outlined
    }
    if (votes.length > 0) {
        attrs["class"] += " " + color;
        attrs["data-tooltip"] = votes.join(", ");
    }

    attrs.onclick = function(e) {
        console.log("button pushed");
        e.stopPropagation();
    };

    return m("td", m("a.button", attrs, votes.length));
}


function vote_row(candidate) {
    // FIXME: need a key on the tr's here
    return m("tr", {
        onclick: function() {
            console.log("row clicked");
        }
    }, [
        // This could show how people have actually voted, but that's kinda bullshit, because people can switch at the last moment
        // and for witch voting, they all share the vote they're casting
        m("td", m("span.icon", candidate.selected ? m("i.fas.fa-skull") : null)), // Make sure to always print the span.icon so the space is filled even if no rows are selected
        m("td", m.trust(candidate.name)), // strong if selected?
        reaction(candidate.strong_save, "is-success"),
        reaction(candidate.save, "is-info"),
        reaction(candidate.kill, "is-warning"),
        reaction(candidate.strong_kill, "is-danger"),
    ]);
}

function reaction_voter(actions) {
    return m("table.table.log-table.is-hoverable.is-fullwidth", // if we keep using log-table, rename it.
        m("thead", m("tr", [
            m("th[colspan=2]", "Villager Hanging"),
            // TODO: Rename these to '(Strong|) (Ignore|Select)' so they work for angels too
            m("th.has-text-centered", {
                "data-tooltip": "Strong save"
            }, "S+"),
            m("th.has-text-centered", {
                "data-tooltip": "Save"
            }, "S"),
            m("th.has-text-centered", {
                "data-tooltip": "Kill"
            }, "K"),
            m("th.has-text-centered", {
                "data-tooltip": "Strong Kill"
            }, "K+"),
        ])),
        m("tbody", actions.map(vote_row)));
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
    ];
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
    ]);
}

function footer() {
    return m("footer.footer", [
        // TODO: link to witch hunt proper & github
        m(".content.has-text-centered", m("p", "© 2020 Kevin Stock")),
    ]);
}

function game_body() {
    return m("section.section", [
        m(".container", [
            m(".columns", [
                m(".column", actions_column()),
                m(".column", log_column()),
            ]),
        ]),
    ]);
}

function input_enter(e) {
    if (e.key === "Enter") {
        send("login", local_state.login_form);
    } else {
        e.redraw = false;
    }
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
                                m("input.input[type=text][placeholder=Lobby][maxlength=12]", {
                                    class: state.login_messages().lobby ? "is-danger" : "",
                                    value: local_state.login_form.lobby,
                                    oninput: function(e) {
                                        local_state.login_form.lobby = e.target.value.toUpperCase();
                                    },
                                    onkeyup: input_enter,
                                }),
                                m("span.icon.is-left", m("i.fas.fa-users")),
                                m("p.help.is-danger", m.trust(state.login_messages().lobby)),
                            ]),
                            m(".control", m("a.button.is-primary", {
                                onclick: function() {
                                    local_state.login_form.lobby = makeid(3);
                                }
                            }, m("span.icon", m("i.fas.fa-dice")))),
                        ]),

                        m(".field", [
                            m(".control.has-icons-left", [
                                m("input.input[type=text][placeholder=Username][maxlength=12]", { // TODO: how's this length restriction?
                                    class: state.login_messages().username ? "is-danger" : "",
                                    value: local_state.login_form.username,
                                    oninput: function(e) {
                                        local_state.login_form.username = e.target.value;
                                    },
                                    onkeyup: input_enter,
                                }),
                                m("span.icon.is-left", m("i.fas.fa-user")),
                                m("p.help.is-danger", m.trust(state.login_messages().username)),
                            ]),
                        ]),

                        m(".field.has-addons", [
                            m(".control.has-icons-left.is-expanded", [
                                m("input.input[type=text][placeholder=Password]", {
                                    class: state.login_messages().password ? "is-danger" : "",
                                    value: local_state.login_form.password,
                                    oninput: function(e) {
                                        local_state.login_form.password = e.target.value;
                                    },
                                    onkeyup: input_enter,
                                }),
                                m("span.icon.is-left", m("i.fas.fa-lock")),
                                m("p.help.is-danger", m.trust(state.login_messages().password)),
                            ]),
                            m(".control", m("a.button.is-primary", {
                                onclick: function() {
                                    local_state.login_form.password = makeid(3);
                                }
                            }, m("span.icon", m("i.fas.fa-dice")))),
                        ]),

                        m(".field", [
                            m(".control", [
                                m("button.button.is-fullwidth.is-link[type=submit]", {
                                    // TODO: class: "is-loading",
                                    onclick: function() {
                                        send("login", local_state.login_form);
                                    },
                                }, "Connect"),
                            ]),
                        ]),
                    ]),
                ]),
            ]),
        ]),
    ]);
}

var Game = {
    view: function() {
        return [
            header(),
            state.logged_in() ? game_body() : login_body(),
            footer(),
        ];
    }
};

m.mount(document.body, Game);
