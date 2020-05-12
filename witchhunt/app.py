import asyncio
import json
import logging

from collections import defaultdict, namedtuple

import websockets

# TODO: rename websocket to 'address' or some shit
Connection = namedtuple("Connection", ["address", "username", "password", "is_admin"])
Message = namedtuple("Message", ["address", "update", "close"], defaults=[{}, False])


async def websocket_send(message):
    if message.close:
        await message.address.close(reason=message.close)
    else:
        await message.address.send(json.dumps(message.update))


class Lobby:
    def __init__(self):
        self.name = None
        self.connections = {}
        self.accepting_users = True

    def __repr__(self):
        return f"{self.name=} {self.accepting_users=} {self.connections=}"

    def login(self, address, lobby=None, username=None, password=None):
        """
        A bit special, this method returns (lobby, messages) so the top level function
        can associate this address with a lobby.
        """
        messages = []

        lobby_error = "" if lobby else "Required"
        username_error = "" if username else "Required"
        password_error = "" if password else "Required"
        is_admin = False

        def error():
            messages.append(
                Message(
                    address,
                    {
                        "clobber": {
                            "login_messages": {
                                "lobby": lobby_error,
                                "username": username_error,
                                "password": password_error,
                            },
                        },
                    },
                )
            )
            return None, messages

        def finish():
            self.connections[username] = Connection(
                address, username, password, is_admin
            )
            # TODO: add message to everyone that someone has joined the lobby
            # TODO: update admin panel
            # TODO: update game selection actions (admin and non-admin)
            messages.append(
                Message(
                    address,
                    {
                        "clobber": {
                            "logged_in": {
                                "lobby": lobby,
                                "username": username,
                                "password": password,
                            },
                        },
                        "actions": ["set_cookies"],
                    },
                )
            )
            return self, messages

        if any((lobby_error, username_error, password_error)):
            return error()

        if not self.connections:
            # This is the first connection. Any username/password is valid.
            self.name = lobby  # Needs to be set lazily because defaultdict is dumb
            is_admin = True
            return finish()

        if username not in self.connections:
            if self.accepting_users:
                return finish()
            else:
                lobby_error = "Game in progress, not accepting new users"
                return error()

        if self.connections[username].password != password:
            password_error = "Incorrect password or username already taken"
            return error()

        # Notify the existing connection that it is being disconnected
        messages.append(
            Message(
                self.connections[username].address,
                close="Connected from another device",
            )
        )
        return finish()


LOBBIES = defaultdict(Lobby)


async def witchhunt_connection(websocket, path):
    lobby = None
    try:
        async for message in websocket:
            msg = json.loads(message)
            action = msg["action"]
            data = msg["data"]

            messages = []

            if action == "login":
                if lobby:
                    logging.error("Extra attempt to login: %s, %s", action, data)
                else:
                    instance = LOBBIES[data.get("lobby")]
                    lobby, messages = instance.login(websocket, **data)
            else:
                # TODO: I think the rest of the calls can delegate to the lobby
                # which can manage dispatching json to functions
                logging.error("unsupported event: %s, %s", action, data)

            if messages:
                await asyncio.wait([websocket_send(msg) for msg in messages])

    finally:
        # TODO: anything to do here? lobby doesn't actually lose player on ws close
        # await connection.unregister(lobby)
        pass


def run():
    logging.basicConfig()

    # TODO: info when we can see info's on terminal
    logging.warning("starting websocket server")

    start_server = websockets.serve(witchhunt_connection, "localhost", 6789)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
