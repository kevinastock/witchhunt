package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Assassin implements Role {
    public static final String NAME = "Assassin";

    @Override
    public String getName() {
        return NAME;
    }
}
