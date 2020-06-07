package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Survivalist implements Role {
    public static final String NAME = "Survivalist";

    @Override
    public String getName() {
        return NAME;
    }
}
