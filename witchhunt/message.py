from collections import namedtuple
from enum import Enum


# str for json encoding: https://stackoverflow.com/a/51976841/392880
class V(str, Enum):
    PUBLIC = "public"
    SECRET = "secret"
    ANGEL = "angel"
    DEMON = "demon"


Message = namedtuple("Message", ["address", "update", "close"], defaults=[{}, False])
