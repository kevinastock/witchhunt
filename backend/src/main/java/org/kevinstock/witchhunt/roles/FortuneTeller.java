package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class FortuneTeller implements Role {
    public static final String NAME = "Fortune Teller";

    @Override
    public String getName() {
        return NAME;
    }
}
