import * as antd from 'antd';
import React from 'react';

import Swal from 'sweetalert2';
import { AppContext } from '../AppContext';
import { ProjectService } from '../utils/firestore';

interface member {
  userEmail: string;
  role: string;
}

const Admin = ({
  projectService,
  rfInstance,
  refresh,
}: {
  projectService: ProjectService;
  rfInstance: any;
  refresh: any;
}) => {
  const appCtx = React.useContext(AppContext);
  const project = projectService.getProject();

  const members: member[] = [];
  project.admins?.map((a) => members.push({ userEmail: a, role: 'admin' }));
  project.users?.map((a) => members.push({ userEmail: a, role: 'user' }));
  project.readers?.map((a) => members.push({ userEmail: a, role: 'reader' }));

  const columns = [
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'User Email',
      dataIndex: 'userEmail',
      key: 'userEmail',
    },
    {
      title: 'Action',
      key: 'x',
      render: (item: member) => (
        <div className="flex space-x-2">
          <antd.Button
            danger
            disabled={!projectService.getAuth(appCtx.user?.email || '', 'editAdmin')}
            onClick={() => removeMember(item.userEmail)}
          >
            Delete
          </antd.Button>
        </div>
      ),
    },
  ];

  const changeName = async () => {
    const projectName = prompt('修改專案名稱: ', project.projectName);
    if (projectName) {
      if (rfInstance) {
        const flow = rfInstance.toObject();
        await projectService.updateProject({
          id: project.id,
          flow,
          projectName,
          public: project.public,
        });
        refresh();
      }
    }
  };

  const addMember = async () => {
    const { value: email } = await Swal.fire({
      title: "Please input user's email",
      input: 'email',
      inputPlaceholder: 'Enter your email address',
      inputValidator: (value) => {
        if (!value) {
          return 'Email address is required';
        }
        return null;
      },
    });
    const { value: role } = await Swal.fire({
      title: 'Select member role',
      input: 'select',
      inputOptions: {
        users: 'users',
        readers: 'readers',
      },
      showCancelButton: true,
    });

    await projectService.addMember(role, email);
    refresh();
  };

  const removeMember = async (email: string) => {
    const { isDenied } = await Swal.fire({
      title: `Delete Member ${email}?`,
      showConfirmButton: false,
      showDenyButton: true,
      showCancelButton: true,
      denyButtonText: `Don't save`,
    });

    if (isDenied) {
      await projectService.removeMember(email);
      refresh();
    }
  };

  return (
    <div className="fixed z-30 flex">
      <antd.Collapse className="flex-1 bg-white">
        <antd.Collapse.Panel header="管理" key="1">
          <div className="m-2">
            <div className="flex justify-between mb-2">
              <antd.Button onClick={changeName} type="primary">
                {'專案: ' + project.projectName}
              </antd.Button>
              <antd.Button
                type="primary"
                disabled={!projectService.getAuth(appCtx.user?.email || '', 'editAdmin')}
                onClick={addMember}
              >
                Add Member
              </antd.Button>
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
