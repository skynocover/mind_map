import React from 'react';
import * as antd from 'antd';

import { AppContext } from '../AppContext';

export const Header = () => {
  const appCtx = React.useContext(AppContext);

  const UserMenu = () => (
    <div className="overflow-hidden bg-white rounded shadow-lg">
      <antd.Button
        danger
        className="flex text-sm font-medium leading-none text-justify text-gray-800"
        onClick={appCtx.signOut}
      >
        Logout
      </antd.Button>
    </div>
  );

  const [open, setOpen] = React.useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <>
      <header className="w-full text-gray-100 bg-gray-900 shadow body-font">
        <div className="container flex flex-col flex-wrap items-center p-5 mx-auto md:flex-row">
          <nav className="flex flex-wrap items-center text-base lg:w-2/5 md:ml-auto">
            {/* <div className="mr-5 border-b border-transparent cursor-pointer hover:text-gray-900 hover:border-indigo-600">
              <Link href="https://skynocover.github.io/komica_saas_homepage/">
                <a target="_blank">About</a>
              </Link>
            </div> */}
          </nav>

          <div className="inline-flex ml-5 lg:w-2/5 lg:justify-end lg:ml-0">
            {appCtx.user ? (
              <div className="flex items-center">
                <antd.Popover
                  content={<UserMenu />}
                  trigger="click"
                  open={open}
                  onOpenChange={handleOpenChange}
                >
                  <antd.Button className="h-10 pl-5 pr-5 text-blue-400 bg-gray-900  rounded-full appearance-non focus:outline-none">
                    {appCtx.user.displayName}
                  </antd.Button>
                </antd.Popover>
              </div>
            ) : (
              <a className="px-3 py-2 ml-4 text-white bg-indigo-700 rounded-lg hover:bg-indigo-500">
                Login
              </a>
            )}
            <>
              <div className="relative inline-flex ml-2">
                <svg
                  className="absolute top-0 right-0 w-2 h-2 m-4 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 412 232"
                >
                  <path
                    d="M206 171.144L42.678 7.822c-9.763-9.763-25.592-9.763-35.355 0-9.763 9.764-9.763 25.592 0 35.355l181 181c4.88 4.882 11.279 7.323 17.677 7.323s12.796-2.441 17.678-7.322l181-181c9.763-9.764 9.763-25.592 0-35.355-9.763-9.763-25.592-9.763-35.355 0L206 171.144z"
                    fill="#648299"
                    fillRule="nonzero"
                  />
                </svg>
              </div>
            </>
          </div>
        </div>
      </header>
    </>
  );
};
