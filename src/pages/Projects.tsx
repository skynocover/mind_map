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
import { getAllProjects, Project, createProject } from '../utils/firestore';

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
    key: 'x',
    render: (item: any) => (
      <div className="flex space-x-2">
        <antd.Button type="primary">
          <Link to={'/project/' + item.id}>Edit</Link>
        </antd.Button>
        <antd.Button type="ghost">Delete</antd.Button>
      </div>
    ),
  },
];
// TODO:
// 組織人員管理
// public的心智圖

const Projects = () => {
  const auth = getAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const addProject = async () => {
    const projectName = prompt('Enter the project name');
    const user = auth.currentUser;

    if (user && projectName) {
      //   await setDoc(doc(firestore, 'mindMap', 'projects', user.uid, createId()), {
      //     // projectId: createId(),
      //     projectName,
      //     // content: {},
      //   });
      //   init();
      createProject(user.uid, projectName);
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
    <div className="m-2">
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
    </div>
  );
};

export default Projects;
