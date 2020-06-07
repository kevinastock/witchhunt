package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class Nurse implements Role {
    public static final String NAME = "Nurse";

    @Override
    public String getName() {
        return NAME;
    }
}
