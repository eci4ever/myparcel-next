import sql from "@/lib/db";
import bcrypt from "bcrypt";

const { faker } = require("@faker-js/faker");

// Function to generate fake users
function generateUsers(count = 10) {
  const users = [];

  for (let i = 0; i < count; i++) {
    users.push({
      id: faker.string.uuid(), // or faker.datatype.uuid() in older versions
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: "123456", // Keep default password or use faker.internet.password()
    });
  }

  return users;
}

async function _seedUsers() {
  const users = generateUsers(10);

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}
//API Route
export async function GET() {
  try {
    await sql.begin(async (_tx) => {
      await _seedUsers();
    });

    return Response.json({ message: "Database seeded successfully ✅" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error }, { status: 500 });
  }
}
