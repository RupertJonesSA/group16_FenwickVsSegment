/*
Here's a list of the main libraries and technologies used in this React application:

1. lightweight-charts (for creating the main stock chart)
2. react-chartjs-2 and Chart.js (for creating the performance comparison bar chart)
3. Axios (for making HTTP requests)
4. Formik (for form management)
5. Yup (for form validation)
6. Material-UI (MUI) components (particularly for date pickers)
7. Day.js (for date manipulation)
8. Tailwind CSS (for styling)
9. technicalindicators (for calculating Bollinger Bands)
10. react-scroll (for smooth scrolling)
11. path-browserify (for path operations in the browser)
12. @mui/x-date-pickers (for advanced date picking components)
13. react-select (for dropdown selection)

*/

import React, { useEffect, useRef, useState, createContext } from "react";
import { createChart } from "lightweight-charts";
import "./css/App.css";
import { Axios } from "axios";
import { useFormik } from "formik";
import { Form } from "./components/Form";
import { Graph } from "./components/Graph";
import background from "./components/markus-spiske-XK8NeUj6Gzs-unsplash.jpg";
import info from "./components/data.json";
import "./css/background.css";
import { initAnimation, initHeader, addListeners } from "./canvas";
import { DataVis } from "./components/dataVis";


function App() {
  //Initializes state variables for ticker, interval, isLoading, and temp using the useState hook.
  const [ticker, setTicker] = useState("");
  const [interval, setInterval] = useState("intraday");
  const [isLoading, setIsLoading] = useState(true);
  const [temp, setTemp] = useState(null);
  const [indexArr, setIndexArr] = useState([0,50]);
  const [dataArray, setDataArray] = useState([]);

  useEffect(() => {
    initHeader();
    initAnimation();
    addListeners();
  }, []);

  return (
    <div>
      <div id="large-header" className="large-header">
        <canvas id="demo-canvas"></canvas>
      </div>

      <div className="flex justify-center">
        <div className="absolute top-1/4 text-white flex flex-col text-center font-extrabold select-none">
          <div className="text-8xl">
            Invest{" "}
            <span className="italic drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              Smart
            </span>
            , Trade{" "}
            <span className="italic drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              Confidently
            </span>
          </div>

          <div className="mt-9 text-5xl">
            Your Path to Financial Freedom Starts Here!
          </div>
        </div>

        <div className="absolute top-1/2">
          <Form
            setTicker={setTicker}
            setInterval={setInterval}
            isLoading={isLoading}
            setTemp={setTemp}
            setIsLoading={setIsLoading}
            temp={temp}
          />
        </div>
      </div>

      <div>
        {!isLoading ? (
          !temp.hasOwnProperty("Error Message") &&
          !temp.hasOwnProperty("Information") ? (
            <>
              <Graph
                temp={temp}
                interval={interval}
                setIsLoading={setIsLoading}
                indexArr={indexArr}
                setIndexArr={setIndexArr}
                dataArray={dataArray}
                setDataArray={setDataArray}
              />
              <DataVis
                indexArr={indexArr}
                setIndexArr={setIndexArr}
                dataArray={dataArray}
              />
            </>
          ) : null
        ) : null}
      </div>

      {/*<Graph
        temp={temp}
        interval={interval}
        setIsLoading={setIsLoading}
        indexArr={indexArr}
        setIndexArr={setIndexArr}
        dataArray={dataArray}
        setDataArray={setDataArray}
      />

      <DataVis
        indexArr={indexArr}
        setIndexArr={setIndexArr}
        dataArray={dataArray}
      />*/}
    </div>
  );
}

export default App;
