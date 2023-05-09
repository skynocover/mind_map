import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  or,
  Firestore,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { createId } from '@paralleldrive/cuid2';

import { firestore } from './firebase';

const initNode = [
  {
    id: '0',
    type: 'input',
    data: { label: 'Node' },
    position: { x: 0, y: 50 },
    width: 150,
    height: 40,
  },
];

export interface Project {
  id: string;
  projectName: string;
  public: boolean;
  users?: string[];
  admins?: string[];
  readers?: string[];
  flow: any;
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
    const { projectName, public: p, flow } = doc.data();
    projects.push({ id: doc.id, projectName, public: p, flow });
  });

  return projects;
};

export const createProject = async (userId: string, projectName: string) => {
  await setDoc(doc(firestore, 'organizations', createId()), {
    projectName,
    admins: [userId],
    readers: [],
    users: [],
    public: false,
  });
};

export const deleteProject = async (projectId: string) => {
  await deleteDoc(doc(firestore, 'organizations', projectId));
};

export class ProjectService {
  private readonly db: Firestore;
  private project: Project = { id: '', projectName: '', public: false, flow: initNode };

  constructor(projectId: string) {
    this.db = firestore;
    this.project.id = projectId;
  }

  async init() {
    const docRef = doc(this.db, 'organizations', this.project.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { projectName, flow, admins, users, readers, public: p } = docSnap.data();

      this.project = { id: this.project.id, projectName, flow, admins, users, readers, public: p };
    }
    return this;
  }

  getProject(): Project {
    return this.project;
  }

  async updateProject(project: Project) {
    await updateDoc(doc(this.db, 'organizations', project.id), {
      flow: project.flow,
      projectName: project.projectName,
    });
  }

  //////////////////////////  Member   //////////////////////////////////////

  async addMember(type: 'admins' | 'users' | 'readers', _email: string) {
    const email = _email.toLowerCase();
    if (!this.project[type]?.includes(email)) {
      this.project[type]?.push(email);
    }
    await updateDoc(doc(this.db, 'organizations', this.project.id), { ...this.project });
  }

  async removeMember(_email: string) {
    const email = _email.toLowerCase();
    this.project.admins = this.project.admins?.filter((v) => v != email);
    this.project.readers = this.project.readers?.filter((v) => v != email);
    this.project.users = this.project.users?.filter((v) => v != email);
    await updateDoc(doc(this.db, 'organizations', this.project.id), { ...this.project });
  }

  ///////////////////////// Auth  ///////////////////////////////////////

  getAuth(email: string, auth: string): boolean {
    switch (auth) {
      case 'readAdmin':
      case 'save':
        return this.project.admins?.includes(email) || this.project.users?.includes(email) || false;

      case 'editAdmin':
        return this.project.admins?.includes(email) || false;

      default:
        return false;
    }
  }
}
