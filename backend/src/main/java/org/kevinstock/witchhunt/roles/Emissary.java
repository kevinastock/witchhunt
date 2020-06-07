package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Emissary implements Role {
    public static final String NAME = "Emissary";

    @Override
    public String getName() {
        return NAME;
    }
}
