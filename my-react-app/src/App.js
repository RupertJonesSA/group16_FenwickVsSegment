import React, { useEffect, useRef, useState, createContext } from "react";
import { createChart } from "lightweight-charts";
import "./App.css";
import { Axios } from "axios";
import { useFormik } from "formik";
import { Form } from "./pages/Form";
import { Graph } from "./pages/Graph";
import background from "./pages/markus-spiske-XK8NeUj6Gzs-unsplash.jpg"
import info from './pages/data.json'

function App() {
  const [ticker, setTicker] = useState("");
  const [interval, setInterval] = useState("intraday");
  const [dataStruct, setDataStruct] = useState("fenwick");
  const [isLoading, setIsLoading] = useState(true);
  const [temp, setTemp] = useState(null);

  let check;

  return (
    <div className="font-sans">

      <div>
        <img src={background} draggable={false} className="relative w-full h-screen brightness-50"/>

        <div className="absolute left-48 top-2/4">
          <Form
            setTicker={setTicker}
            setInterval={setInterval}
            setDataStruct={setDataStruct}
            isLoading={isLoading}
            setTemp={setTemp}
            setIsLoading={setIsLoading}
            temp={temp}
          />
        </div>

      </div>

      <div>
      {!isLoading ? ((!temp.hasOwnProperty("Error Message") && !temp.hasOwnProperty("Information")) ? (<Graph temp={temp} interval={interval} />) : null) : null}
      </div>

    </div>
  );
}

export default App;
