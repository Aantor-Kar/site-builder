import { makeRevision, saveProjectCode, rollbackToVersion, deleteProject, getProjectPreview, getPublishedProjects, getProjectId } from './../controllers/projectController';
import { protect } from './../middlewares/auth';
import express from 'express';

const projectRouter = express.Router();

projectRouter.post('/revision/:projectId', protect, makeRevision);
projectRouter.put('/save/:projectId', protect, saveProjectCode);
projectRouter.get('/rollback/:projectId/:versionId', protect, rollbackToVersion);
projectRouter.delete('/:projectId', protect, deleteProject);
projectRouter.get('/preview/:projectId', protect, getProjectPreview);
projectRouter.get('/published', protect, getPublishedProjects);
projectRouter.get('/published/:projectId', protect, getProjectId);

export default projectRouter