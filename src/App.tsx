import "./App.css";
import FormInsurance from "./components/FormInsurance";

// import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import "preline/preline";
import { IStaticMethods } from "preline/preline";
declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
  }
}

function App() {
  // const location = useLocation();

  // useEffect(() => {
  //   window.HSStaticMethods.autoInit();
  // }, [location.pathname]);

  return (
    <>
      <BrowserRouter>
        <h1 className="text-center font-bold text-xl text-red-500">
          {" "}
          Bonjour ma mon premier test
        </h1>
        <FormInsurance />
      </BrowserRouter>
    </>
  );
}

export default App;
