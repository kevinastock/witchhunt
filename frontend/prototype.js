var state = {
    personal: [],
    logs: [],
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
            m("a", {href: "#", class: "card-footer-item"}, "Fire the cannon!"),
        ]),
    ])
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
                                m("p", {class: "level-item"}, "Settings"),
                            ]),
                        ]),
                    ]),
                ]),
            ]),

            // 3 column body
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

            // footer
            m("footer", {class: "footer"}, [
                // TODO: link to witch hunt proper & github
                m("div", {class: "content has-text-centered"}, m("p", "© 2020 Kevin Stock")),
            ]),
        ]
    }
}

m.mount(document.body, Game)
