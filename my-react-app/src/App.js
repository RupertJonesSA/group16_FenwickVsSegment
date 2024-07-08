import React, { useEffect, useRef, useState, createContext } from 'react';
import { createChart } from 'lightweight-charts';
import './App.css';
import info from '../src/pages/data.json'
import { Axios } from 'axios';
import {useFormik} from 'formik'
import {Form} from './pages/Form'
import {Graph} from './pages/Graph'


function App() {
  const [ticker, setTicker] = useState("");
  const [interval, setInterval] = useState("intraday");
  const [dataStruct, setDataStruct] = useState("fenwick");
  const [isLoading, setIsLoading] = useState(true);
  const [temp, setTemp] = useState(null);

  return (
    <div className="App">
      <Form setTicker={setTicker} setInterval={setInterval} setDataStruct={setDataStruct} isLoading={isLoading} setTemp={setTemp} setIsLoading={setIsLoading}/>
      {!isLoading && <Graph temp={temp}/>}
      <div>{ticker}</div>
    </div>
  );
}

export default App;
