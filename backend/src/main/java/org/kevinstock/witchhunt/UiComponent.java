package org.kevinstock.witchhunt;

public interface UiComponent {
    String getKey();

    void forceSend(Player player); // To ensure a new client connection gets all the data it needs for this component
}
