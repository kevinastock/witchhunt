package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Bomber implements Role {
    public static final String NAME = "Bomber";

    @Override
    public String getName() {
        return NAME;
    }
}
