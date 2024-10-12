import { useState } from "react";
import { LogList } from "./components/log-list";
import { MainViewport } from "./components/main-viewport";
import { EntryPage } from "./components/entry-page";
import { useSokcetStore } from "./stores/socket-store";

function App() {
  const { connect } = useSokcetStore();
  const [isStarted, setStarted] = useState(false);

  if (!isStarted) {
    return <EntryPage onStart={() => {
      connect();
      setStarted(true);
    }} />;
  }

  return (
    <>
      <MainViewport />
      <LogList />
    </>
  );
}

export default App;
