const prisma = require("./prismaClient");
const bcrypt = require("bcrypt");

async function seedUsersOnly() {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const shopperPassword = await bcrypt.hash("shopper123", salt);
  const clientPassword = await bcrypt.hash("client123", salt);

  const admin = await prisma.users.create({
    data: {
      name: "Administrateur Emberton",
      email: "admin@embertongroup.com",
      password: adminPassword,
      role: "admin",
      status: "active",
      city: "Casablanca",
      telephone: "+212600000001",
    },
  });
  console.log("Created Admin user:", admin.email, "id:", admin.id);

  const shopper = await prisma.users.create({
    data: {
      name: "Auditeur Test",
      email: "shopper@embertongroup.com",
      password: shopperPassword,
      role: "shopper",
      status: "active",
      city: "Rabat",
      telephone: "+212600000002",
    },
  });
  console.log("Created Shopper user:", shopper.email, "id:", shopper.id);

  const client = await prisma.users.create({
    data: {
      name: "Client Partenaire",
      email: "client@embertongroup.com",
      password: clientPassword,
      role: "client",
      status: "active",
      city: "Marrakech",
      telephone: "+212600000003",
    },
  });
  console.log("Created Client user:", client.email, "id:", client.id);

  await prisma.$disconnect();
}

seedUsersOnly().catch((err) => {
  console.error("Seeding users failed:", err);
  process.exit(1);
});
