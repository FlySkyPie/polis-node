import { LogList } from "./components/log-list";
import { MainViewport } from "./components/main-viewport";
import { SocketContextProvider } from "./context/socket-context";

function App() {
  return (
    <SocketContextProvider>
      <MainViewport />
      <LogList />
    </SocketContextProvider>
  );
}

export default App;
