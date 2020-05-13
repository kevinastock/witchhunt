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
