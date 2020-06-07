package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Hunter implements Role {
    public static final String NAME = "Hunter";

    @Override
    public String getName() {
        return NAME;
    }
}
