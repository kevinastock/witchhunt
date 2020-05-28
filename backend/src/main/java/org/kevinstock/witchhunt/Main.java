package org.kevinstock.witchhunt;

import org.java_websocket.server.WebSocketServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) {
        Logger logger = LoggerFactory.getLogger(Main.class);
        logger.info("Hello world");

        String host = "localhost";
        int port = 6789;

        WebSocketServer server = new SimpleServer(new InetSocketAddress(host, port));
        // TODO: exit cleaner?
        // https://github.com/TooTallNate/Java-WebSocket/blob/master/src/main/example/ChatServer.java#L84-L95
        //server.run();
        server.start();
    }
}
