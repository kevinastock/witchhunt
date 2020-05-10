import asyncio
import json
import logging

import websockets


async def register(websocket):
    pass


async def unregister(websocket):
    pass


def init_client():
    pass


async def witchhunt_connection(websocket, path):
    await register(websocket)
    try:
        await websocket.send(init_client())  # TODO
        async for message in websocket:
            # TODO
            data = json.loads(message)
            print(data)
    finally:
        await unregister(websocket)


def run():
    logging.basicConfig()

    logging.warning("starting websocket server")

    start_server = websockets.serve(witchhunt_connection, "localhost", 6789)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
