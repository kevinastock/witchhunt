package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Priest implements Role {
    public static final String NAME = "Priest";

    @Override
    public String getName() {
        return NAME;
    }
}
