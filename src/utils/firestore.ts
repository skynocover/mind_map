import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';

import { firestore } from './firebase';

export interface Project {
  id: string;
  projectName: string;
  flow?: any;
}

export const getAllProjects = async (userId: string): Promise<Project[]> => {
  const docSnap = await getDocs(collection(firestore, 'mindMap', 'projects', userId));
  const projects: Project[] = [];
  docSnap.forEach((item) => {
    projects.push({
      id: item.id,
      projectName: item.data().projectName,
    });
  });
  return projects;
};

export const getProject = async (
  userId: string,
  projectId: string,
): Promise<Project | undefined> => {
  const docRef = doc(firestore, 'mindMap', 'projects', userId, projectId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const { projectName, flow } = docSnap.data();

    return {
      id: projectId,
      projectName,
      flow,
    };
  }
};

export const setProject = async (userId: string, project: Project) => {
  await setDoc(doc(firestore, 'mindMap', 'projects', userId, project.id), {
    flow: project.flow,
    projectName: project.projectName,
  });
};
