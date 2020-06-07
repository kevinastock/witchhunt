package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Spiritualist implements Role {
    public static final String NAME = "Spiritualist";

    @Override
    public String getName() {
        return NAME;
    }
}
