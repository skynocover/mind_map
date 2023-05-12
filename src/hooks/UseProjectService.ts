import React, { useCallback } from 'react';
import { ProjectService, Project } from '../utils/firestore';

export const useProjectService = (projectId: string) => {
  const [projectService, setProjectService] = React.useState<ProjectService>();

  // 修改時不會需要重新渲染 所以使用useRef
  const project = React.useRef<Project>();

  // 要傳進其他的component 所以使用useCallback
  const refresh = useCallback(async () => {
    if (projectId !== '') {
      const service = new ProjectService(projectId);
      await service.init();
      setProjectService(service);
      project.current = service.getProject();
    }
  }, [projectId]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const updateProject = async (project: Project) => {
    if (projectService) {
      await projectService.updateProject(project);
    }
  };

  const getAuth = (email: string, auth: string) => {
    return projectService?.getAuth(email, auth);
  };

  return { projectService, updateProject, getAuth, refresh, project: project.current };
};
