import "./App.css";
import Store from "./store/Store";
import Main from "./components/Main";

function App() {
  return (
    <Store>
      <Main />
    </Store>
  );
}

export default App;
