package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Oracle implements Role {
    public static final String NAME = "Oracle";

    @Override
    public String getName() {
        return NAME;
    }
}
