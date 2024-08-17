import { useState } from "react";
import { LogList } from "./components/log-list";
import { MainViewport } from "./components/main-viewport";
import { SocketContextProvider } from "./context/socket-context";
import { EntryPage } from "./components/entry-page";

function App() {
  const [isStarted, setStarted] = useState(false);

  if (!isStarted) {
    return <EntryPage onStart={() => setStarted(true)} />;
  }

  return (
    <SocketContextProvider>
      <MainViewport />
      <LogList />
    </SocketContextProvider>
  );
}

export default App;
