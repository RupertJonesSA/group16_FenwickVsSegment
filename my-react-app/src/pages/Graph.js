import React, { useEffect, useRef, useState, createContext } from "react";
import { createChart } from "lightweight-charts";

export const Graph = (props) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    const chartOptions = {
      layout: {
        textColor: "white",
        background: { type: "solid", color: "#171b26" },
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

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div className="bg-[rgba(23,27,38,255)] h-[925px] w-full flex justify-center align-center">
      <div ref={chartContainerRef} className="h-[800px] w-3/4 pt-10 pl-5" />
      <div className="h-full w-[500px]"></div>
    </div>
  );
};
