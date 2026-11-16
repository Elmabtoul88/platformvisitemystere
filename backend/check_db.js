const prisma = require("./prismaClient");

async function check() {
  const models = [
    "users",
    "missions",
    "stores",
    "applications",
    "reports",
    "survey_questions",
    "survey_sections",
    "chat_messages",
    "bank_info",
    "paiyments",
    "notifications",
    "user_notifications",
    "mission_recognition_quizzes",
    "mission_recognition_results",
    "mission_recognition_settings",
  ];

  console.log("--- TABLE ROW COUNTS ---");
  for (const model of models) {
    if (prisma[model]) {
      const count = await prisma[model].count();
      console.log(`${model}: ${count}`);
    } else {
      console.log(`${model}: (model not found on prisma)`);
    }
  }

  await prisma.$disconnect();
}

check().catch((err) => {
  console.error(err);
  process.exit(1);
});
