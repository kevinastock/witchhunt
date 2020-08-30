package org.kevinstock.witchhunt;

import org.java_websocket.server.WebSocketServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) throws InterruptedException, IOException {
        Logger logger = LoggerFactory.getLogger(Main.class);

        String host = "localhost";
        int port = 6789;

        WebSocketServer server = new SimpleServer(new InetSocketAddress(host, port));
        try {
            logger.info("Starting server");
            server.run();
        } finally {
            // Ensure that when intellij stops this process, we actually close the socket.
            server.stop(3000);
        }
    }
}
