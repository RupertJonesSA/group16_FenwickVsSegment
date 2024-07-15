import React, { useEffect, useRef, useState, createContext } from "react";
import { createChart } from "lightweight-charts";
import "./App.css";
import { Axios } from "axios";
import { useFormik } from "formik";
import { Form } from "./pages/Form";
import { Graph } from "./pages/Graph";
import background from "./pages/markus-spiske-XK8NeUj6Gzs-unsplash.jpg"
import info from './pages/data.json';
import { animateScroll } from 'react-scroll';
import "./background.css";
import { initAnimation, initHeader, addListeners } from './canvas';


function App() {
  const [ticker, setTicker] = useState("");
  const [interval, setInterval] = useState("intraday");
  const [dataStruct, setDataStruct] = useState("fenwick");
  const [isLoading, setIsLoading] = useState(true);
  const [temp, setTemp] = useState(null);

  let check;

  animateScroll.scrollToBottom({duration: 1000, smooth: true});

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
        
        <div className="absolute top-1/4 text-white flex flex-col text-center font-extrabold">
          <div className="text-8xl">
            Invest <span className="italic drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]" >Smart</span>, Trade <span className="italic drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">Confidently</span>
          </div>

          <div className="mt-9 text-5xl">
            Your Path to Financial Freedom Starts Here!
          </div>
        </div>

        <div className="absolute top-1/2">
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

      {/*<div>
      {!isLoading ? ((!temp.hasOwnProperty("Error Message") && !temp.hasOwnProperty("Information")) ? (
        <Graph temp={temp} interval={interval} setIsLoading={setIsLoading}/>
        
        
        ) : null) : null}
      </div>*/}



    <Graph temp={temp} interval={interval} setIsLoading={setIsLoading}/>

    </div>
  );
}

export default App;
