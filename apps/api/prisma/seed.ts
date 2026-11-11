import { demoOrganizationSlug, demoOwnerEmail } from "../src/config/demo.ts";
import { disconnectDatabase, getDatabase } from "../src/services/database.ts";
import { TaskPriority, TaskStatus } from "../src/generated/prisma/enums.ts";

const projectId = "68c84a4d-a28c-4542-97d0-38f18673204e";
const tasks = [
  {
    id: "a4494047-7aac-40f8-8265-f01808ee203f",
    title: "Write the delivery brief",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
  },
  {
    id: "bb06f7e9-3a48-4cbb-a693-bbc84a0b5812",
    title: "Review repository conventions",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
  },
  {
    id: "bc67a326-b37c-40a5-b5db-25ec2e04e978",
    title: "Draft the first implementation plan",
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
  },
];

try {
  await getDatabase().$transaction(async (database) => {
    const user = await database.user.upsert({
      where: { email: demoOwnerEmail },
      create: { name: "Demo Owner", email: demoOwnerEmail },
      update: {},
      select: { id: true, passwordHash: true },
    });
    if (user.passwordHash !== null) throw new Error("The reserved demo owner must not have credentials.");
    const organization = await database.organization.upsert({
      where: { slug: demoOrganizationSlug },
      create: { name: "FORGE AI Demo", slug: demoOrganizationSlug },
      update: {},
    });
    const membership = { organizationId: organization.id, userId: user.id };
    await database.organizationMember.upsert({
      where: { organizationId_userId: membership },
      create: { ...membership, role: "OWNER" },
      update: {},
    });
    await database.project.upsert({
      where: { id: projectId, organizationId: organization.id },
      create: {
        id: projectId,
        organizationId: organization.id,
        name: "Delivery Workspace",
        description: "A sample project for the local API.",
      },
      update: {},
    });

    for (const task of tasks) {
      await database.task.upsert({
        where: { id: task.id, projectId },
        create: { ...task, projectId, assigneeId: user.id },
        update: {},
      });
    }
  });
  console.info("FORGE AI demo data is ready.");
} finally {
  await disconnectDatabase();
}
