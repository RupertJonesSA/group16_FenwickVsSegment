import React, { useEffect, useRef, useState, createContext } from "react";
import { createChart } from "lightweight-charts";
import info from "./data.json";
import "path-browserify";
import { animateScroll } from "react-scroll";
import { SMA, EMA, RSI, BollingerBands } from "technicalindicators";
import useSegmentTree from "./customHooks/useSegmentTree.js";

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
      color: "rgba(0, 255, 255, 0.4)",
    });
    middleBandSeries.setData(middleBandData);

    const lowerBandSeries = chart.addLineSeries({
      color: "rgba(0, 255, 0, 0.4)",
    });
    lowerBandSeries.setData(lowerBandData);

    chart.timeScale().applyOptions({
      borderColor: "#71649C",
      barSpacing: 20,
    });

    return () => {
      chart.remove();
    };
  }, [props.temp]);

  // Use custom hook to calculate relevant metrics to current data and interval
  const param1Ref = useRef(null);
  const param2Ref = useRef(null);
  const {
    rsi,
    cumulativeSum,
    intervalAverage,
    intervalVariance,
    aroonUp,
    aroonDown,
  } = useSegmentTree(pricesArray, param1Ref, param2Ref);

  return (
    <div className="bg-[rgba(0,7,21,255)] h-[925px] w-full flex justify-around align-center">
      <div ref={chartContainerRef} className="h-[800px] w-3/4 pt-10 pl-5" />
      <div className="flex flex-col mt-10 h-[800px] justify-around gap-4 text-[rgba(94,103,118,255)] text-center text-2xl font-semibold">
        <p>{pricesArray.length}</p>
        <input type="number" ref={param1Ref} />
        <input type="number" ref={param2Ref} />
        <button>Calculate</button>
        <p>Result is: {rsi}</p>
        <div className="bg-[rgba(15,22,38,255)] w-80 h-32 rounded-xl flex flex-col justify-center">
          Cumulative Sum
          <p className="text-white text-3xl pt-2">${cumulativeSum}</p>
        </div>
        <div className="bg-[rgba(15,22,38,255)] w-80 h-32 rounded-xl flex flex-col justify-center">
          Interval Average
          <p className="text-white text-3xl pt-2">${intervalAverage}</p>
        </div>
        <div className="bg-[rgba(15,22,38,255)] w-80 h-32 rounded-xl flex flex-col justify-center">
          Variance
          <p className="text-white text-3xl pt-2">{intervalVariance}</p>
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
