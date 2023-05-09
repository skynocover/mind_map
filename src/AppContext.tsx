import React from 'react';
import {
  getAuth,
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import * as antd from 'antd';

const provider = new GoogleAuthProvider();
interface AppContextProps {
  user: User | undefined;
  setModal: React.Dispatch<any>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = React.createContext<AppContextProps>(undefined!);

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = React.useState<User | undefined>();
  const [modal, setModal] = React.useState<any>(null);
  const auth = getAuth();

  React.useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUser(user);
          // const uid = user.uid;
          // console.log({ uid, token: await user.getIdToken() });
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

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        const token = credential.accessToken;
        const user = result.user;
        console.log({ user, token });
        // navigate('/projects');
      }
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log({ errorCode, errorMessage, credential, email });
    }
  };

  const signOut = async () => {
    await auth.signOut();
  };

  /////////////////////////////////////////////////////

  return (
    <AppContext.Provider value={{ user, setModal, signIn, signOut }}>
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
