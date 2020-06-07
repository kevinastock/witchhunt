package org.kevinstock.witchhunt.roles;

import org.kevinstock.witchhunt.Role;

public class DirtyOldBastard implements Role {
    public static final String NAME = "Dirty Old Bastard";

    @Override
    public String getName() {
        return NAME;
    }
}
