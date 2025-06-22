import projectModel from "../models/project.model.js";

export const createProject = async ({ name, userId }) => {
  if (!name || !userId) {
    throw new Error("Name and userId are required");
  }

  let project;
  try {
    project = await projectModel.create({
      name,
      users: [userId]
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("Project name must be unique");
    }
    throw err; // ✅ correct: rethrow the same caught error
  }

  return project; // ✅ return the created project
};
