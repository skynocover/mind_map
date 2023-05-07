import * as antd from 'antd';
import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { AppContext } from '../AppContext';
import { AddProject } from '../components/AddProject';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { createId } from '@paralleldrive/cuid2';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { firestore } from '../utils/firebase';
import { getAllProjects, Project } from '../utils/firestore';
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Name',
    dataIndex: 'projectName',
    key: 'projectName',
  },
  {
    title: 'Action',
    dataIndex: '',
    key: 'x',
    render: (item: any) => (
      <>
        <antd.Button>
          <Link to={'/project/' + item.id}>GoTo</Link>
        </antd.Button>
        <a>Delete</a>
      </>
    ),
  },
];

const Projects = () => {
  const appCtx = React.useContext(AppContext);
  const auth = getAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const addProject = async () => {
    const projectName = prompt('Enter the project name');
    const user = auth.currentUser;

    if (user && projectName) {
      await setDoc(doc(firestore, 'mindMap', 'projects', user.uid, createId()), {
        // projectId: createId(),
        projectName,
        // content: {},
      });
      init();
    }
  };
  const user = auth.currentUser;
  const init = async () => {
    if (user) {
      const projects = await getAllProjects(user.uid);
      setProjects(projects);
    }
  };

  React.useEffect(() => {
    init();
  }, [user]);

  return (
    <>
      <div className="flex justify-end mb-2">
        <antd.Button type="primary" onClick={addProject}>
          Add
        </antd.Button>
      </div>
      <antd.Spin spinning={false}>
        <antd.Table
          scroll={{ x: 800 }}
          dataSource={projects}
          columns={columns}
          pagination={false}
        />
      </antd.Spin>
    </>
  );
};

export default Projects;
