import "./App.css";
import { PlusIcon } from "./assets/icons/PlusIcon";
import { ShareIcon } from "./assets/icons/ShareIcon";
import { Button } from "./components/ui/Button";

function App() {
  return (
    <>
      <Button
        variant="primary"
        text="Add Content"
        size="md"
        startIcon={<PlusIcon size="lg" />}
        //   endIcopn={<>+</>}
      />
      <Button
        variant="secondary"
        text="Share"
        size="md"
        startIcon={<ShareIcon size="lg" />}
        //   startIcon={<>-</>}
        //   endIcopn={<>+</>}
      />
    </>
  );
}

export default App;
