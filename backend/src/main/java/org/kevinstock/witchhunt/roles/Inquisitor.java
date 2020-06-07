package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Inquisitor implements Role {
    public static final String NAME = "Inquisitor";

    @Override
    public String getName() {
        return NAME;
    }
}
