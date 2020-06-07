package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Gravedigger implements Role {
    public static final String NAME = "Gravedigger";

    @Override
    public String getName() {
        return NAME;
    }
}
