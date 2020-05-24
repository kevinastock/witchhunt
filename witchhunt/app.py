import asyncio
import json
import logging

from collections import defaultdict

import websockets

from witchhunt.lobby import Lobby


LOBBIES = defaultdict(Lobby)


async def websocket_send(message):
    if message.close:
        await message.address.close(reason=message.close)
    else:
        await message.address.send(json.dumps(message.update))


async def witchhunt_connection(websocket, path):
    lobby = None
    try:
        async for message in websocket:
            msg = json.loads(message)
            action = msg["action"]
            data = msg["data"]
            seq_id = msg["seq_id"]

            messages = []

            if action == "login":
                if lobby:
                    logging.error("Extra attempt to login: %s, %s", action, data)
                else:
                    instance = LOBBIES[data.get("lobby")]
                    lobby, messages = instance.login(websocket, **data)
            elif action == "button":
                messages = lobby.click_button(websocket, seq_id=seq_id, **data)
            else:
                raise Exception(f"Unexpected request from user: {message}")

            if messages:
                # TODO: is it worth trying to group updates to a single user?
                # Unfortunately requires a lot of knowledge about how that data
                # is merged which isn't here.
                await asyncio.wait([websocket_send(msg) for msg in messages])

    finally:
        # TODO: anything to do here? lobby doesn't actually lose player on ws
        # close but we should probably notify it so it can let other players
        # know this person is offline
        # await connection.unregister(lobby)
        pass


def run():
    logging.basicConfig()

    # TODO: info when we can see info's on terminal
    logging.warning("starting websocket server")

    start_server = websockets.serve(witchhunt_connection, "localhost", 6789)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
