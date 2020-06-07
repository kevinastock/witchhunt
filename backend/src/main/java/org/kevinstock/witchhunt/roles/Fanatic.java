package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Fanatic implements Role {
    public static final String NAME = "Fanatic";

    @Override
    public String getName() {
        return NAME;
    }
}
