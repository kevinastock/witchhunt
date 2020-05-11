import asyncio
import json
import logging

from collections import defaultdict, namedtuple

import websockets

Connection = namedtuple("Connection", ["websocket", "username", "password", "is_admin"])


class Lobby:
    def __init__(self):
        self.name = None
        self.connections = {}
        self.accepting_users = True

    def __repr__(self):
        return f"{self.name=} {self.accepting_users=} {self.connections=}"

    async def login(self, websocket, lobby=None, username=None, password=None):
        lobby_error = "" if lobby else "Required"
        username_error = "" if username else "Required"
        password_error = "" if password else "Required"
        is_admin = False

        async def error():
            await websocket.send(
                json.dumps(
                    {
                        "clobber": {
                            "login_messages": {
                                "lobby": lobby_error,
                                "username": username_error,
                                "password": password_error,
                            },
                        },
                    }
                )
            )
            return None

        async def finish():
            self.connections[username] = Connection(
                websocket, username, password, is_admin
            )
            await websocket.send(
                # TODO: what to send if they're an admin?
                json.dumps(
                    {
                        "clobber": {
                            "logged_in": {
                                "lobby": lobby,
                                "username": username,
                                "password": password,
                            },
                        },
                        "actions": ["set_cookies"],
                    }
                )
            )
            return self

        if any((lobby_error, username_error, password_error)):
            return await error()

        if not self.connections:
            # This is the first connection. Any username/password is valid.
            self.name = lobby  # Needs to be set lazily because defaultdict is dumb
            is_admin = True
            return await finish()

        if username not in self.connections:
            if self.accepting_users:
                return await finish()
            else:
                lobby_error = "Game in progress, not accepting new users"
                return await error()

        if self.connections[username].password != password:
            password_error = "Incorrect password or username already taken"
            return await error()

        # Notify the existing connection that it is being disconnected
        await self.connections[username].websocket.close(
            reason="Connected from another device"
        )
        return await finish()


LOBBIES = defaultdict(Lobby)


async def witchhunt_connection(websocket, path):
    lobby = None
    try:
        async for message in websocket:
            msg = json.loads(message)
            action = msg["action"]
            data = msg["data"]

            if action == "login":
                instance = LOBBIES[data.get("lobby")]
                lobby = await instance.login(websocket, **data)
                print(lobby)
            else:
                logging.error("unsupported event: {}: {}", action, data)
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
