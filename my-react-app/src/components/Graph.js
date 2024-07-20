import React, { useEffect, useRef, useState, createContext } from "react";
import { createChart } from "lightweight-charts";
import info from "./data.json";
import "path-browserify";
import { animateScroll } from "react-scroll";
import { SMA, EMA, RSI, BollingerBands } from "technicalindicators";

export const Graph = (props) => {
  const chartContainerRef = useRef();
  const [pricesArray, setPricesArray] = useState([]);

  useEffect(() => {
    animateScroll.scrollToBottom({ duration: 1000, smooth: true });

    const chartOptions = {
      layout: {
        textColor: "white",
        background: { type: "solid", color: "#000715" },
      },
    };
    const chart = createChart(chartContainerRef.current, chartOptions);
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    //let timeSeries = info["Time Series (5min)"];

    let timeSeries;
    if (props.interval === "intraday") {
      timeSeries = props.temp["Time Series (5min)"];
    } else if (props.interval === "daily") {
      timeSeries = props.temp["Time Series (Daily)"];
    } else if (props.interval === "weekly") {
      timeSeries = props.temp["Weekly Time Series"];
    } else if (props.interval === "monthly") {
      timeSeries = props.temp["Monthly Time Series"];
    }

    const transformedData = Object.keys(timeSeries).map((key) => {
      const {
        "1. open": open,
        "2. high": high,
        "3. low": low,
        "4. close": close,
      } = timeSeries[key];

      return {
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        time: Date.parse(key) / 1000,
      };
    });

    const data = transformedData.sort((a, b) => a.time - b.time);

    const closingData = data.map((d) => d.close);

    // This type of array is necessary in order to allocate bytes into memory and provide the C++
    // code with necessary memory access. (MAKE SURE TO ALLOCATE 8 BYTES PER ELEMENT)
    const flt64Data = new Float64Array(closingData.length);
    for (let i = 0; i < closingData.length; ++i) {
      flt64Data[i] = closingData[i];
    }
    setPricesArray(flt64Data);
    console.log(closingData);

    const period = 20;
    const stdDev = 2;
    const bb = BollingerBands.calculate({
      period: period,
      values: closingData,
      stdDev: stdDev,
    });

    const upperBandData = bb.map((band, index) => ({
      time: data[index + period - 1].time,
      value: band.upper,
    }));

    const middleBandData = bb.map((band, index) => ({
      time: data[index + period - 1].time,
      value: band.middle,
    }));

    const lowerBandData = bb.map((band, index) => ({
      time: data[index + period - 1].time,
      value: band.lower,
    }));

    candlestickSeries.setData(data);

    const upperBandSeries = chart.addLineSeries({
      color: "rgba(255, 0, 0, 0.4)",
    });
    upperBandSeries.setData(upperBandData);

    const middleBandSeries = chart.addLineSeries({
      color: "rgba(0, 0, 255, 0.4)",
    });
    middleBandSeries.setData(middleBandData);

    const lowerBandSeries = chart.addLineSeries({
      color: "rgba(0, 255, 0, 0.4)",
    });
    lowerBandSeries.setData(lowerBandData);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [props.temp]);

  // Beginning of wasm C++ segment tree import
  const [result, setResult] = useState(null);
  const param1Ref = useRef(null);
  const param2Ref = useRef(null);

  const wasmModule = require("../react-wasm/build/segment_implem.js");

  const calculateRSI = () => {
    // Load wasmModule from js file
    wasmModule.default().then((instance) => {
      // Set up number of bytes required for prices array
      const numBytes = pricesArray.length * pricesArray.BYTES_PER_ELEMENT;
      const pricesArrayPtr = instance._malloc(numBytes); // allocate memory

      instance.HEAPF64.set(
        pricesArray,
        pricesArrayPtr / pricesArray.BYTES_PER_ELEMENT,
      );

      const param1 = parseInt(param1Ref.current.value);
      const param2 = parseInt(param2Ref.current.value);

      // access stand-alone functions via ccall
      const compute_rsi = instance.ccall(
        "compute_rsi",
        "number",
        ["number", "number", "number", "number"],
        [
          pricesArrayPtr,
          param2, 
          param1,
          pricesArray.length,
        ],
      );

      setResult(compute_rsi);

      instance._free(pricesArrayPtr);
    });
  };

  return (
    <div className="bg-[rgba(0,7,21,255)] h-[925px] w-full flex justify-around align-center">
      <div ref={chartContainerRef} className="h-[800px] w-3/4 pt-10 pl-5" />
      <div className="flex flex-col mt-10 h-[800px] justify-around gap-4 text-[rgba(94,103,118,255)] text-center text-2xl font-semibold">
        <p>{pricesArray.length}</p>
        <input type="number" ref={param1Ref} />
        <input type="number" ref={param2Ref} />
        <button onClick={() => calculateRSI()}>Calculate</button>
        <p>Result is: {result}</p>
        <div className="bg-[rgba(15,22,38,255)] w-80 h-32 rounded-xl flex flex-col justify-center">
          Cumulative Sum
          <p className="text-white text-3xl pt-2">$172.32</p>
        </div>
        <div className="bg-[rgba(15,22,38,255)] w-80 h-32 rounded-xl flex flex-col justify-center">
          Cumulative Average
          <p className="text-white text-3xl pt-2">$179.94</p>
        </div>
        <div className="bg-[rgba(15,22,38,255)] w-80 h-32 rounded-xl flex flex-col justify-center">
          Variance
          <p className="text-white text-3xl pt-2">$180.53</p>
        </div>
        <div className="bg-[rgba(15,22,38,255)] w-80 h-32 rounded-xl flex flex-col justify-center">
          Secant Line
          <p className="text-white text-3xl pt-2">y = 2.5x + 176.52</p>
        </div>
        <div className="bg-[rgba(15,22,38,255)] w-80 h-32 rounded-xl flex flex-col justify-center">
          Time Taken
          <p className="text-white text-3xl pt-2">1.2 ms</p>
        </div>
      </div>
    </div>
  );
};
