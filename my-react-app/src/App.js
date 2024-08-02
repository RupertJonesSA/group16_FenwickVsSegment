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
      {!isLoading ? ((!temp.hasOwnProperty("Error Message") && !temp.hasOwnProperty("Information")) ? (
        <>
        <Graph temp={temp} interval={interval} setIsLoading={setIsLoading}/>
        <DataVis/>
        </>
        
        ) : null) : null}

      </div>

      {/*<Graph
        temp={temp}
        interval={interval}
        setIsLoading={setIsLoading}
      />
      
      <DataVis/>*/}

    </div>
  );
}

export default App;
