var Cookies = require("js-cookie");
var m = require("mithril");
var Stream = require("mithril/stream");


var updates = Stream();

var state = {};

function update_clobber(accumulator, update) {
    return update;
}

function update_append(accumulator, update) {
    accumulator.push(...update);
    // TODO: short circuit sorting if we're only adding one element and it's id is greater than the previous last one
    accumulator.sort(function(a, b) {
        return a.id - b.id;
    });
    return accumulator;
}

function update_versioned(accumulator, update) {
    if (!accumulator.has(update.key)) {
        accumulator.set(update.key, {
            data: null,
            server_seq_id: -1,
            seen_client_seq_id: -1
        });
    }

    // When updated, server_seq_id and seen_client_seq_id are each set to the max of current and seen in the message. data is updated iff server_seq_id increases
    let item = accumulator.get(update.key);

    if (update.server_seq_id > item.server_seq_id) {
        item.data = update.data;
        item.server_seq_id = update.server_seq_id;
    }

    if ('seen_client_seq_id' in update) {
        item.seen_client_seq_id = Math.max(item.seen_client_seq_id, update.seen_client_seq_id);
    }

    return accumulator;
}

function add_state_field(name, init, update_strategy) {
    state[name] = Stream.scan(update_strategy, init,
        updates.map(function(update) {
            if (name in update) {
                return update[name];
            }
            return Stream.SKIP;
        }));
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

add_state_field("admin_buttons", [], update_clobber);

add_state_field("logs", [], update_append);

add_state_field("versioned_data", new Map(), update_versioned);
// Special keys in versioned_data: i.e., not uuids:
//  * "components" - a list of other keys in versioned_data to show the user
// TODO: we need some way to nuke this map at the end of a game - or at least on logout

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
    pending_search: {
        version: -1
    },
    search_id: 0,
    next_search_id: 1,
    log_search_result: Stream([]),

    selector_seq_id: 1,

    versioned_data: new Map(),

    header_class: "is-primary",

    modal: no_modal,
};

function lookup_versioned(key, missing = null) {
    // If a local_state.versioned_data with the same id exists, and a higher client_seq_id than seen_client_seq_id, use data from there instead
    let in_state = state.versioned_data().has(key);
    let in_local = local_state.versioned_data.has(key);
    if (!in_state && !in_local) {
        // We may lookup components before the server sends us any.  It kinda
        // sucks to pass in missing, but it's not clear what type to expect.
        return missing;
    } else if (in_state && !in_local) {
        return state.versioned_data().get(key).data;
    } else if (!in_state && in_local) {
        return local_state.versioned_data.get(key).data;
    } else {
        let server_ver = state.versioned_data().get(key);
        let client_ver = local_state.versioned_data.get(key);

        if (client_ver.sent_client_seq_id > server_ver.seen_client_seq_id) {
            return client_ver.data;
        }

        return server_ver.data;
    }
}

function click_selector(selector_key, btn, idx, value, max_selected) {
    let data = lookup_versioned(selector_key, []).slice();
    let client_seq_id = local_state.selector_seq_id++;

    if (value && !data.includes(idx)) {
        data.push(idx);
        if (data.length > max_selected) {
            data = data.slice(1);
        }
    } else if (!value && data.includes(idx)) {
        data.splice(data.indexOf(idx), 1);
    }

    local_state.versioned_data.set(selector_key, {
        sent_client_seq_id: client_seq_id,
        data: data,
    });

    let msg = {
        client_seq_id: client_seq_id,
        key: btn,
        value: value,
    };

    send("set", msg);
}

// Attach state to window for debugging since parcel hides it
window.wh = {
    state: state,
    local: local_state,
};

function search_in_progress() {
    return local_state.search_id + 1 < local_state.next_search_id;
}

local_state.searcher.onmessage = function(e) {
    if (local_state.pending_search.version > e.data.version && local_state.pending_search.version > local_state.search_id) {
        local_state.searcher.postMessage(local_state.pending_search);
    }

    if (e.data.version < local_state.search_id) {
        return;
    }

    local_state.search_id = e.data.version;
    local_state.log_search_result(e.data.logs);
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

    if (search_in_progress()) {
        local_state.pending_search = {
            logs: logs,
            query: query,
            version: local_state.next_search_id++
        };
    } else {
        local_state.searcher.postMessage({
            logs: logs,
            query: query,
            version: local_state.next_search_id++
        });
    }

    return Stream.SKIP;
}, state.logs, local_state.log_search_query);

var ws = new WebSocket("ws://127.0.0.1:6789/"); // TODO: wss

ws.onmessage = function(e) {
    let data = JSON.parse(e.data);

    // FIXME: debugging
    console.log(data);

    updates(data);
    m.redraw();
};

ws.onclose = function(e) {
    // This is also closed if the connection can't be established, so that's good
    // TODO: better notify the user that they're disconnected
    // put up a modal?
    console.log(e.reason);
    setTimeout(function() {
        // Delay changing the header so refreshing the page doesn't flash the header color
        local_state.header_class = "is-danger";
        m.redraw();
    }, 100);
};

function send(action, data) {
    ws.send(JSON.stringify({
        action: action,
        data: data,
    }));
}

// TODO: do some heartbeating like https://github.com/websockets/ws#how-to-detect-and-close-broken-connections ?

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
    var day_phase_icon;
    switch (l.day_phase) {
        case "day":
            day_phase_icon = m("i.fas.fa-sun");
            break;
        case "night":
            day_phase_icon = m("i.fas.fa-moon");
            break;
            // TODO: dusk
        default:
            day_phase_icon = m("i.fas.fa-question");
            break;
    }

    var visibility_icon;
    switch (l.visibility) {
        case "public":
            visibility_icon = null;
            break;
        case "secret":
            visibility_icon = m("i.fas.fa-user-secret");
            break;
        case "angel": // FIXME: angle and demon could be merged as "death"
            // TODO
            visibility_icon = null;
            break;
        case "demon":
            // TODO
            visibility_icon = null;
            break;
        default:
            day_phase_icon = m("i.fas.fa-question");
            break;
    }

    return m("tr", {
        key: l.id
    }, [
        m("td", m("span.icon", visibility_icon)), // Make sure to always print the span.icon so the space is filled even if no rows are private
        m("td", m.trust(l.message)),
        m("td.has-text-grey-light", m("span.icon", day_phase_icon)),
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

    return m("nav.pagination[role=navigation]", [
        m("a.pagination-previous", prev_button_attrs, "Previous"),
        m("a.pagination-next", next_button_attrs, "Next"),
        m("ul.pagination-list", items),
    ]);
}

function log_column() {
    return [
        m(".field", [
            m(".control.has-icons-left", [
                m("input.input[type=text][placeholder=Search]", {
                    class: search_in_progress() ? "is-danger" : "",
                    oninput: function(e) {
                        local_state.log_search_query(e.target.value);
                    },
                }),
                m("span.icon.is-left", m("i.fas.fa-search")),
            ]),
            // TODO: if there's text here, add an X on the right to clear it. I don't know how to make an icon in an input clickable.
        ]),

        m("table.table.log-table.is-hoverable.is-fullwidth",
            m("tbody", log_rows_page(local_state.log_search_result()))),

        paginator(local_state.log_search_result().length),
    ];
}

function reaction_voter_header(voter) {
    if (voter.show_reactions) {
        return [
            m("th[colspan=2]", voter.title),
            m("th.has-text-centered", {
                "data-tooltip": "Strong No"
            }, "N+"),
            m("th.has-text-centered", {
                "data-tooltip": "No"
            }, "N"),
            m("th.has-text-centered", {
                "data-tooltip": "Yes"
            }, "Y"),
            m("th.has-text-centered", {
                "data-tooltip": "Strong Yes"
            }, "Y+"),
        ];
    } else {
        return m("th[colspan=2]", voter.title);
    }
}

function reaction_voter_footer(voter) {
    return m("th", {
        "colspan": voter.show_reactions ? 6 : 2
    }, m("span.has-text-info.has-text-weight-normal", voter.note));
}

function reaction(row, reaction_index, color) {
    var votes = [];

    for (let [name, selector] of Object.entries(row.reactions)) {
        if (lookup_versioned(selector, []).includes(reaction_index)) {
            votes.push(name);
        }
    }

    var attrs = {};
    attrs["class"] = "";

    let is_selected = lookup_versioned(row.my_reaction_selector, []).includes(reaction_index);
    if (!is_selected) {
        attrs["class"] += "is-light ";
    }

    if (votes.length > 0) {
        attrs["class"] += color;
        attrs["data-tooltip"] = votes.join(", ");
    }

    attrs.onclick = function(e) {
        click_selector(row.my_reaction_selector, row.my_reaction_actions[reaction_index], reaction_index, !is_selected, 1);
        e.stopPropagation(); // Don't click the row as well
    };

    return m("td", m("a.button", attrs, votes.length));
}

function reaction_voter_row(voter, row, index) {
    let selected = lookup_versioned(voter.selector, []).includes(index);
    let reactions = [];
    if (voter.show_reactions) {
        reactions = [
            reaction(row, 0, "is-danger"),
            reaction(row, 1, "is-warning"),
            reaction(row, 2, "is-info"),
            reaction(row, 3, "is-success"),
        ];
    }
    return m("tr", {
        onclick: function() {
            if ("select_action" in row) {
                click_selector(voter.selector, row.select_action, index, !selected, voter.max_selected);
            }
        },
        key: row.choice,
    }, [
        // This could show how people have actually voted, but that's kinda bullshit, because people can switch at the last moment
        // and for witch voting, they all share the vote they're casting
        // FIXME: use icon from voter
        m("td", m("span.icon", selected ? m(`i.fas.fa-${voter.icon}`) : m("i.invisible.fas.fa-times-circle"))), // the invisible icon is because otherwise this gets all out of whack. https://github.com/jgthms/bulma/issues/2976 Even my suggested &nbsp; fix doesn't actually work - it's off by 1/2 a pixel.
        m("td", {
            class: selected ? "has-text-weight-bold" : ""
        }, row.choice),
        ...reactions,
    ]);
}

function draw_reaction_voter(voter) {
    return m("table.table.log-table.is-hoverable.is-fullwidth", // if we keep using log-table, rename it.
        m("thead", m("tr", reaction_voter_header(voter))),
        m("tfoot", m("tr", reaction_voter_footer(voter))),
        m("tbody", voter.rows.map((row, index) => reaction_voter_row(voter, row, index)))
    );
}

function draw_button(button) {
    return m("button.button.is-primary.is-fullwidth", {
        onclick: function() {
            send("set", {
                client_seq_id: local_state.selector_seq_id++,
                key: button.action,
                value: true,
            });
        }
    }, button.message);
}

function draw_buttons(buttons) {
    return m(".buttons", buttons.map(draw_button));
}

function draw_component(component) {
    switch (component.type) {
        case "REACTION_VOTER":
            return draw_reaction_voter(component);
        case "BUTTONS":
            return draw_buttons(component.buttons);
        default:
            return m(".notification.is-danger", "Unknown component type " + component.type);
    }
}

function actions_column() {
    return lookup_versioned("components", []).map(lookup_versioned).map(draw_component);
    /*
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
    */
}

function no_modal() {
    return undefined;
}

function close_modal() {
    local_state.modal = no_modal;
}


function modal_helper(title, body) {
    // TODO: might need is-clipped somewhere if modals get long
    return m(".modal.is-active", [
        m(".modal-background", {
            onclick: close_modal
        }),
        m(".modal-card", [
            m("header.modal-card-head", [
                m("p.modal-card-title", title),
                m("button.delete", {
                    onclick: close_modal
                }),
            ]),
            m("section.modal-card-body", body),
            m("footer.modal-card-foot"),
        ]),
    ]);
}

function rules_modal() {
    // TODO: dump the rule book here
    return modal_helper("Rules", m("a", {href: "http://chocolatepi.net/files/witchhunt_rulebook_web.pdf"}, "Official rule book"));
}

function lobby_modal() {
    // TODO: this should show who's in the lobby, if they're connected, and if they've been killed
    // TODO: leave lobby button
    return modal_helper("Lobby", m("span", "Hello world"));
}

function settings_modal() {
    // TODO: allow setting number of log records to show
    // TODO: dark mode!
    return modal_helper("Settings", m("span", "Hello world"));
}

function admin_modal() {
    // TODO: just a list of admin buttons
    //  * pause
    //  * advance phase
    //  * kick player
    return modal_helper("Admin", draw_buttons(state.admin_buttons()));
}

function header() {
    let navlinks = [];
    if (state.admin_buttons().length > 0) {
        navlinks.push(m("a.navbar-item", {
            onclick: function() {
                local_state.modal = admin_modal;
            }
        }, "Admin"));
    }
    if (state.logged_in()) {
        navlinks.push(m("a.navbar-item", {
            onclick: function() {
                local_state.modal = lobby_modal;
            }
        }, "Lobby"));
    }
    navlinks.push(m("a.navbar-item", {
        onclick: function() {
            local_state.modal = rules_modal;
        }
    }, "Rules"));
    navlinks.push(m("a.navbar-item", {
        onclick: function() {
            local_state.modal = settings_modal;
        }
    }, "Settings"));

    return m("nav.navbar.is-fixed-top[role=navigation]", {
        class: local_state.header_class
    }, [
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
                    m("span"),
                    m("span"),
                    m("span"),
                ]),
            ]),

            m(".navbar-menu#navMenu", m(".navbar-end", navlinks)),
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
            m("div.non-footer", [
                header(),
                state.logged_in() ? game_body() : login_body(),
            ]),
            footer(),
            local_state.modal(),
        ];
    }
};

m.mount(document.body, Game);
