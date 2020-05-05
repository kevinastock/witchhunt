var state = {
    personal: [],
    logs: [
        {id: 1, msg: "test message 1", cls: ""},
        {id: 2, msg: "test message 2", cls: "is-dark"},
        {id: 3, msg: "test message 3", cls: "is-primary"},
        {id: 4, msg: `
            The standard Lorem Ipsum passage, used since the 1500s

            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC

            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
            1914 translation by H. Rackham

            "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"
            Section 1.10.33 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC

            "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."
            1914 translation by H. Rackham

            "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains."`,
            cls: "is-link"},
        {id: 5, msg: "test message 5", cls: "is-info"},
        {id: 6, msg: "test message 6", cls: "is-success"},
        {id: 7, msg: "test message 7", cls: "is-warning"},
        {id: 8, msg: `<span data-tooltip="foo,bar,baz">Hello World</span>`, cls: "is-danger"},
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
    /*
     // Message + level ends up looking pretty shitty
    return m("article", {class: "message"}, [
        m("div", {class: "message-body"}, [
            m.trust(l.msg),
            m("nav", {class: "level"}, [
                m("div", {class: "level-left"}, [
                    m("div", {class: "buttons has-addons level-item"}, [
                        m("a", {onclick: function() {}, class: "button is-small"},
                            m("span", {class: "icon has-text-grey-light"}, m("i", {class: "fas fa-info-circle"}))
                        ),
                        m("a", {onclick: function() {}, class: "button is-small"},
                            m("span", {class: "icon has-text-success"}, [m("i", {class: "fas fa-check-square fa-fw"}),"4"])
                        ),
                        m("a", {onclick: function() {}, class: "button is-small"},
                            m("span", {class: "icon has-text-info"}, m("i", {class: "fas fa-info-circle"}))
                        ),
                        m("a", {onclick: function() {}, class: "button is-small"},
                            m("span", {class: "icon has-text-info"}, m("i", {class: "fas fa-info-circle"}))
                        ),
                    ]),
                ]),
                m("div", {class: "level-left"}, [
                    m("div", {class: "level-item"},
                        m("span", {class: "has-text-grey-light"}, "Night 1")
                    ),
                ]),
            ]),
        ]),
    ])
    */

    // Using cards isn't too bad. Lots of lost space, but buttons are easy
    /*
     * Ok, this card is shaping up pretty good. Worst case we can rebuild bulma with smaller margins.
     * How do indicate to the user which options they have selected? <strong>?
     *
     * Is there a background color for card-footer-item? Oh, that's easy, use has-background-light
     *
     * Maybe we can use buttons here, with the right combination of is-marginless and is-paddingless
     *
     * So what all is going on here:
     *   yea, just jam the msg from the server into a trusted content. Done.
     *   For each button (of which there will be a known set):
     *   create an anchor, with an onclick to toggle l.id for this icon.
     *      If >0 votes for that icon, add appropriate has-text-color and span for count
     *      if _I_ voted for it, add has-background-light
     *
     *  It's not clear what the rating here should be. For witches, something like "strong kill, kill, no kill, strong no kill", maybe with a "idk" option as well
     *
     *  Fuck it, this has been fun, but maybe log messages shouldn't have reactions at all. They're super useful on the voting, but less so here
     */
    return [
        m("div", {class: "card"}, [
            m("div", {class: "card-content"}, [
                m("div", {class: "content"}, m.trust(l.msg)),
            ]),
            m("footer", {class: "card-footer"}, [
                m("a", {onclick: function() {}, class: "card-footer-item"},
                    m("span", {class: "icon has-text-grey-light"}, m("i", {class: "fas fa-info-circle"}))
                ),
                m("a", {onclick: function() {}, class: "card-footer-item has-text-grey-light"}, [
                    m("span", {class: "icon"}, m("i", {class: "fas fa-check-square"})),
                    m("span", ""),
                ]),
                m("a", {onclick: function() {}, class: "card-footer-item has-text-success has-background-light", "data-tooltip":"A,B,C,D"}, [
                    m("span", {class: "icon"}, m("i", {class: "fas fa-check-square"})),
                    m("span", "4"),
                ]),
                m("a", {onclick: function() {}, class: "card-footer-item has-text-info"},
                    m("span", {class: "icon"}, m("i", {class: "fas fa-info-circle"}))
                ),
                m("a", {onclick: function() {}, class: "card-footer-item"},
                    m("span", {class: "icon has-text-info"}, m("i", {class: "fas fa-info-circle"}))
                ),
                m("div", {class: "card-footer-item"},
                    m("span", {class: "has-text-grey-light"}, "Night 1")
                ),
            ]),
        ]),
        m("br"),
    ]

    /*
    // Box was kinda a bitch. card does box right.
    return m("div", {class: "box"}, [
        m("div", {class: "content"}, m.trust(l.msg)),

        m("nav", {class: "level"}, [
            m("div", {class: "level-left"}, [
                m("a", {class: "level-item"},
                    m("span", {class: "icon is-small has-text-info"}, m("i", {class: "fas fa-info-circle"})),
                ),
            ]),
        ]),
    ])
    */
        //m("span", {class: "is-pulled-right"}, "emojis and shit"),
        /*
        m("div", {class: "is-pulled-right"}, [

                            m("button", {class: "button is-success", onclick: function() {console.log("foobar");}}, [
                                m("span", {class: "icon is-small"}, m("i", {class: "fas fa-check-square"})),
                            ]),
                            m("button", {class: "button is-warning", onclick: function() {console.log("foobar");}}, [
                                m("span", {class: "icon is-small"}, m("i", {class: "fas fa-exclamation-triangle"})),
                            ]),
                            m("button", {class: "button is-danger", onclick: function() {console.log("foobar");}}, [
                                m("span", {class: "icon is-small"}, m("i", {class: "fas fa-ban"})),
                            ]),
            m("div", {class: "dropdown is-hoverable is-right is-pulled-right"}, [
                m("div", {class: "dropdown-trigger"}, [
                    m("button", {class: "button", "aria-haspopup": "true", "aria-controls": `log-emoji-${l.id}`}, [
                        m("span", {class: "icon is-small"}, m("i", {class: "far fa-smile", "aria-hidden": "true"})),
                    ]),
                ]),
                m("div", {class: "dropdown-menu", id: `log-emoji-${l.id}`, role: "menu"}, [
                    m("div", {class: "dropdown-content"}, [
                        // TODO: pick a good set of icons
                        // far fa-thumbs-up
                        // far fa-thumbs-down
                        // fas fa-hat-wizard?
                        m("div", {class: "dropdown-item"}, [
                            m("button", {class: "button is-info", onclick: function() {console.log("foobar");}}, [
                                m("span", {class: "icon is-small"}, m("i", {class: "fas fa-info-circle"})),
                            ]),
                            m("button", {class: "button is-success", onclick: function() {console.log("foobar");}}, [
                                m("span", {class: "icon is-small"}, m("i", {class: "fas fa-check-square"})),
                            ]),
                            m("button", {class: "button is-warning", onclick: function() {console.log("foobar");}}, [
                                m("span", {class: "icon is-small"}, m("i", {class: "fas fa-exclamation-triangle"})),
                            ]),
                            m("button", {class: "button is-danger", onclick: function() {console.log("foobar");}}, [
                                m("span", {class: "icon is-small"}, m("i", {class: "fas fa-ban"})),
                            ]),
                        ]),
                    ]),
                ]),
            ]),
        ]),
    ])
        */
}

var Game = {
    view: function() {
        return [
            // Header
            m("section", {class: "hero is-primary"}, [
                m("div", {class: "hero-body"}, [
                    m("div", {class: "container"}, [
                        m("nav", {class: "level"}, [
                            m("div", {class: "level-left"}, [
                                m("h1", {class: "level-item title"}, "Witch Hunt"),
                            ]),
                            m("div", {class: "level-right"}, [
                                // TODO: add some notifications here
                                // TODO: phase and time remaining, live updates
                                // TODO: what settings? how to set?
                                // TODO: action button modal with timer on it
                                m("p", {class: "level-item"}, "Settings"),
                            ]),
                        ]),
                    ]),
                ]),
            ]),

            m("section", {class: "section"}, [
                m("div", {class: "container"},
                    // TODO: add a search bar
                    state.logs.map(view_log_msg)
                    // TODO: don't show all messages, use: https://bulma.io/documentation/components/pagination/
                ),
            ]),

            // 3 column body
            /*
            m("section", {class: "section"}, [
                m("div", {class: "container"}, [
                    m("div", {class: "columns"}, [
                        m("div", {class: "column"}, [
                            player_card(),
                            // TODO: Admin card?
                            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                            // m("button", {class: "button", style: "width: 100%"}, "Engage"),
                        ]),
                        m("div", {class: "column"}, [
                            // TODO: add a search bar
                            // TODO: sequence of https://bulma.io/documentation/components/message/#message-body-only
                            //       with only message body. Color by privacy/type of info.
                            //       use a lighter text color to show day / phase of message
                            // TODO: don't show all messages, use: https://bulma.io/documentation/components/pagination/
                            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                            // m("button", {class: "button", style: "width: 100%"}, "Engage"),
                        ]),
                        m("div", {class: "column"}, [
                            // TODO: https://bulma.io/documentation/components/panel/
                            //          * 'checkbox' buttons
                            //          * text boxes
                            //          * 'submit' / instant buttons
                            //          * color based on type of action?
                            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                            // m("button", {class: "button", style: "width: 100%"}, "Engage"),
                        ]),
                    ]),
                ]),
            ]),
            */

            // footer
            m("footer", {class: "footer"}, [
                // TODO: link to witch hunt proper & github
                m("div", {class: "content has-text-centered"}, m("p", "© 2020 Kevin Stock")),
            ]),
        ]
    }
}

m.mount(document.body, Game)
