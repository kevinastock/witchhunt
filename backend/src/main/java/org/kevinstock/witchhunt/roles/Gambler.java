package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Gambler implements Role {
    public static final String NAME = "Gambler";

    @Override
    public String getName() {
        return NAME;
    }
}
