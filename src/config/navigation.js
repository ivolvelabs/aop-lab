export const NAV_ITEMS = [
  {
    path: "/",
    name: "Home",
    icon: "home",
    roles: ["admin", "technician", "receptionist", "thirdparty"],
  },
  {
    path: "/bookings",
    name: "Bookings",
    icon: "bookings",
    roles: ["admin", "technician", "receptionist", "thirdparty"],
  },
  {
    path: "/thirdparty",
    name: "Doctors & Hospitals",
    icon: "thirdparty",
    roles: ["admin", "receptionist"],
  },
  {
    path: "/masters",
    name: "Masters",
    icon: "masters",
    roles: ["admin", "technician", "receptionist"],
  },
  {
    path: "/usersandpermissions",
    name: "Users and Permissions",
    icon: "users",
    roles: ["admin"],
  },
  {
    path: "/templates",
    name: "Templates",
    icon: "templates",
    roles: ["admin", "technician", "receptionist"],
  },
];
