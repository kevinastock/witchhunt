package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class PeepingTom implements Role {
    public static final String NAME = "Peeping Tom";

    @Override
    public String getName() {
        return NAME;
    }
}
