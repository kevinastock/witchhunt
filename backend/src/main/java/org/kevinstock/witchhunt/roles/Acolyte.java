package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Acolyte implements Role {
    public static final String NAME = "Acolyte";

    @Override
    public String getName() {
        return NAME;
    }
}
