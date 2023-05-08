import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  or,
  Firestore,
} from 'firebase/firestore';
import { createId } from '@paralleldrive/cuid2';
import { firestore } from './firebase';

export interface Project {
  id: string;
  projectName: string;
  users?: string[];
  admins?: string[];
  readers?: string[];
  flow?: any;
}

export const getAllProjects = async (userId: string): Promise<Project[]> => {
  const projects: Project[] = [];

  const query2 = query(
    collection(firestore, 'organizations'),
    or(
      where('users', 'array-contains', userId),
      where('readers', 'array-contains', userId),
      where('admins', 'array-contains', userId),
    ),
  );
  const querySnapshot = await getDocs(query2);
  querySnapshot.forEach((doc) => {
    const { projectName } = doc.data();
    projects.push({
      id: doc.id,
      projectName,
    });
  });

  return projects;
};

export const getProject = async (projectId: string): Promise<Project | undefined> => {
  // const docRef = doc(firestore, 'mindMap', 'projects', userId, projectId);
  const docRef = doc(firestore, 'organizations', projectId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const { projectName, flow, admins, users, readers } = docSnap.data();

    return { id: projectId, projectName, flow, admins, users, readers };
  }
};

export const setProject = async (project: Project) => {
  await setDoc(
    doc(firestore, 'organizations', project.id),
    { flow: project.flow, projectName: project.projectName },
    { merge: true },
  );
};

export const createProject = async (userId: string, projectName: string) => {
  await setDoc(doc(firestore, 'organizations', createId()), {
    projectName,
    admins: [userId],
    readers: [],
    users: [],
  });
};

export class ProjectService {
  private readonly db: Firestore;

  constructor() {
    this.db = firestore;
  }

  async getAllProjects(userId: string): Promise<Project[]> {
    const projects: Project[] = [];

    const query2 = query(
      collection(this.db, 'organizations'),
      or(
        where('users', 'array-contains', userId),
        where('readers', 'array-contains', userId),
        where('admins', 'array-contains', userId),
      ),
    );
    const querySnapshot = await getDocs(query2);
    querySnapshot.forEach((doc) => {
      const { projectName } = doc.data();
      projects.push({ id: doc.id, projectName });
    });

    return projects;
  }

  async getProject(projectId: string): Promise<Project | undefined> {
    const docRef = doc(this.db, 'organizations', projectId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const a = docSnap.data();
      console.log({ a });
      const { projectName, flow, admins, users, readers } = docSnap.data();

      return { id: projectId, projectName, flow, admins, users, readers };
    }
  }

  async setProject(project: Project) {
    await setDoc(
      doc(this.db, 'organizations', project.id),
      { flow: project.flow, projectName: project.projectName },
      { merge: true },
    );
  }

  async createProject(userId: string, projectName: string) {
    await setDoc(doc(this.db, 'organizations', createId()), {
      projectName,
      admins: [userId],
      readers: [],
      users: [],
    });
  }
}
