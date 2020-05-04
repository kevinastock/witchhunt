var websocket = new WebSocket("ws://127.0.0.1:6789/");

var state = {
    value: "?",
    users: "?",
}

minus = function (event) {
    websocket.send(JSON.stringify({action: 'minus'}));
}

plus = function (event) {
    websocket.send(JSON.stringify({action: 'plus'}));
}

websocket.onmessage = function (event) {
    data = JSON.parse(event.data);
    switch (data.type) {
        case 'state':
            state.value = data.value;
            break;
        case 'users':
            state.users = (
                data.count.toString() + " user" +
                (data.count == 1 ? "" : "s"));
            break;
        default:
            console.error("unsupported event", data);
    }
    m.redraw();
};

var WsCounter = {
    view: function() {
        return m("div", [
            m("div", {class: "buttons"}, [
                m("div", {class: "minus button", onclick: minus}, "-"),
                m("div", {class: "value"}, state.value),
                m("div", {class: "plus button", onclick: plus}, "+"),
            ]),
            m("div", {class: "state"}, [
                m("span", {class: "users"}, state.users),
                " online",
            ]),
        ])
    }
}

m.mount(document.body, WsCounter)
