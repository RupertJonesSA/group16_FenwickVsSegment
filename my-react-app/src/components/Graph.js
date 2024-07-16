import React, { useEffect, useRef, useState, createContext } from "react";
import { createChart } from "lightweight-charts";
import info from "./data.json";

export const Graph = (props) => {
  const chartContainerRef = useRef();

  useEffect(() => {
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

    let timeSeries = info["Time Series (5min)"];


    /*let timeSeries;
    if (props.interval === "intraday") {
      timeSeries = props.temp["Time Series (5min)"];
    } else if (props.interval === "daily") {
      timeSeries = props.temp["Time Series (Daily)"];
    } else if (props.interval === "weekly") {
      timeSeries = props.temp["Weekly Time Series"];
    } else if (props.interval === "monthly") {
      timeSeries = props.temp["Monthly Time Series"];
    }*/

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

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div className="bg-[rgba(0,7,21,255)] h-[925px] w-full flex justify-around align-center">
      <div ref={chartContainerRef} className="h-[800px] w-3/4 pt-10 pl-5" />
      <div className="flex flex-col mt-10 h-[800px] justify-around gap-4 text-[rgba(94,103,118,255)] text-center text-2xl font-semibold">
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
