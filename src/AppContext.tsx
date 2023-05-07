import React from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import * as antd from 'antd';

interface AppContextProps {
  //   user: User | undefined;
  //   firestore: Firestore;
  setModal: React.Dispatch<any>;
}

const AppContext = React.createContext<AppContextProps>(undefined!);

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = React.useState<User | undefined>();

  const [modal, setModal] = React.useState<any>(null);

  React.useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
          const uid = user.uid;
          console.log({ uid });
        } else {
          // User is signed out
          // ...
        }
      });
      ///
    } catch (error) {
      ///
    }
  };

  React.useEffect(() => {
    init();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /////////////////////////////////////////////////////

  return (
    <AppContext.Provider value={{ setModal }}>
      {children}

      {modal && (
        <antd.Modal
          //   visible={modal !== null}
          onOk={() => setModal(null)}
          onCancel={() => setModal(null)}
          //   footer={null}
          //   closable={false}
          //   width={modalWidth}
        >
          {modal}
        </antd.Modal>
      )}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
