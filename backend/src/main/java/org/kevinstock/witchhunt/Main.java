package org.kevinstock.witchhunt;

import org.java_websocket.server.WebSocketServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) throws InterruptedException, IOException {
        Logger logger = LoggerFactory.getLogger(Main.class);

        String host = "localhost";
        int port = 6789;

        WebSocketServer server = new SimpleServer(new InetSocketAddress(host, port));
        server.start();
        logger.info("Started");

        // This is just a gross hack because I can't get intellij to shutdown
        // cleanly. Hit enter on stdin to shutdown the server - releasing the
        // port so you can start it again immediately.
        // https://github.com/TooTallNate/Java-WebSocket/blob/master/src/main/example/ChatServer.java#L84-L95
		BufferedReader sysin = new BufferedReader( new InputStreamReader( System.in ) );
        String in = sysin.readLine();
        server.stop(3000);
    }
}
