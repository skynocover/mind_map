import * as antd from 'antd';
import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { AppContext } from '../AppContext';
import { AddProject } from './AddProject';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { createId } from '@paralleldrive/cuid2';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { firestore } from '../utils/firebase';

import { ProjectService, Project } from '../utils/firestore';

const columns = [
  {
    title: 'identity',
    dataIndex: 'identity',
    key: 'identity',
  },
  {
    title: 'UserId',
    dataIndex: 'userId',
    key: 'userId',
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

const projectService = new ProjectService();

interface member {
  userId: string;
  identity: string;
}

const Admin = ({ project, rfInstance }: { project: Project; rfInstance: any }) => {
  console.log(project);

  const [projectName, setProjectName] = React.useState<string>('');

  const members: member[] = [];
  project.admins?.map((a) => {
    members.push({ userId: a, identity: 'admin' });
  });
  project.users?.map((a) => {
    members.push({ userId: a, identity: 'users' });
  });
  project.readers?.map((a) => {
    members.push({ userId: a, identity: 'readers' });
  });

  React.useEffect(() => {
    setProjectName(project.projectName);
  }, []);

  const changeName = () => {
    const projectName = prompt('修改專案名稱: ');
    if (projectName) {
      setProjectName(projectName);
      if (rfInstance) {
        const flow = rfInstance.toObject();
        projectService.setProject({ id: project.id, flow, projectName });
      }
    }
  };

  return (
    <div className="flex fixed z-10">
      <antd.Collapse className="bg-white flex-1">
        <antd.Collapse.Panel header="管理" key="1">
          <div className="m-2">
            <div className="flex justify-between ">
              <antd.Button onClick={changeName} type="primary">
                {'專案: ' + projectName}
              </antd.Button>
              <antd.Button type="primary">Add Member</antd.Button>
            </div>
            <antd.Table
              scroll={{ x: 800 }}
              dataSource={members}
              columns={columns}
              pagination={false}
            />
          </div>
        </antd.Collapse.Panel>
      </antd.Collapse>
    </div>
  );
};

export default Admin;
