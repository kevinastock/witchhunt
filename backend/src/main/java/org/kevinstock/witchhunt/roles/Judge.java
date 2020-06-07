package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Judge implements Role {
    public static final String NAME = "Judge";

    @Override
    public String getName() {
        return NAME;
    }
}
