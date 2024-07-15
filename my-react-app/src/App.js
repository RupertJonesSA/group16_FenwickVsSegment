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


function App() {
  const [ticker, setTicker] = useState("");
  const [interval, setInterval] = useState("intraday");
  const [dataStruct, setDataStruct] = useState("fenwick");
  const [isLoading, setIsLoading] = useState(true);
  const [temp, setTemp] = useState(null);

  let check;

  animateScroll.scrollToBottom({duration: 1000, smooth: true});

  return (
    <div>

      <img src={background} draggable={false} className="relative w-full h-screen brightness-50"/>

      <div className="flex justify-center">
        
        <div className="absolute top-1/4 text-white flex flex-col text-center font-extrabold">
          <div className="text-8xl">
            Invest <span className="italic" >Smart</span>, Trade <span className="italic">Confidently</span>
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

      <div>
      {!isLoading ? ((!temp.hasOwnProperty("Error Message") && !temp.hasOwnProperty("Information")) ? (
        <Graph temp={temp} interval={interval} setIsLoading={setIsLoading}/>

        
        ) : null) : null}
      </div>

    </div>
  );
}

export default App;
