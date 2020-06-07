package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Apprentice implements Role {
    public static final String NAME = "Apprentice";

    @Override
    public String getName() {
        return NAME;
    }
}
