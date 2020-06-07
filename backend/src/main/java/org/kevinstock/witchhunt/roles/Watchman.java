package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Watchman implements Role {
    public static final String NAME = "Watchman";

    @Override
    public String getName() {
        return NAME;
    }
}
