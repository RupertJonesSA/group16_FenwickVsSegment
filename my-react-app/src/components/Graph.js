
import React, { useEffect, useRef, useState } from "react";
import { LineStyle, createChart } from "lightweight-charts";
import info from "./data.json";
import "path-browserify";
import { animateScroll } from "react-scroll";
import { BollingerBands } from "technicalindicators";
import { CustomRange } from "./customRange.js";

export const Graph = (props) => {
  //Initializes references and states for a chart component.
  const chartContainerRef = useRef();
  const [pricesArray, setPricesArray] = useState([]);
  const [isClicked, setIsClicked] = useState(false);
  const [timeIDS, setTimeIDS] = useState([]);

  useEffect(() => {
    //Scrolls to a specific position on the page with animation
    /*animateScroll.scrollTo(850, {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
    });*/

    //Creates a chart with the specified options and adds a candlestick series to it.
    const chartOptions = {
      layout: {
        textColor: "white",
        background: { type: "solid", color: "rgba(0,20,50,1)" },
      },
    };
    const chart = createChart(chartContainerRef.current, chartOptions);
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#0b9981",
      downColor: "#f23645",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    //let timeSeries = info["Monthly Time Series"];

    //Assigns the appropriate time series data based on the interval specified in the props object
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

    //Transforms the time series data object into an array of objects with parsed float values and converted time format.
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
    setTimeIDS(data.map((d) => d.time));

    console.log(timeIDS);

    // This type of array is necessary in order to allocate bytes into memory and provide the C++
    // code with necessary memory access. (MAKE SURE TO ALLOCATE 8 BYTES PER ELEMENT)
    const flt64Data = new Float64Array(closingData.length);
    for (let i = 0; i < closingData.length; ++i) {
      flt64Data[i] = closingData[i];
    }
    props.setDataArray(flt64Data);
    props.setIndexArr([0, closingData.length-1]);

    //Calculates Bollinger Bands based on the given period, closing data, and standard deviation.
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

    //Adds three line series to a given chart with different colors representing upper, middle, and lower bands.
    const upperBandSeries = chart.addLineSeries({
      color: "#f23645",
      lineWidth: "1",
    });
    upperBandSeries.setData(upperBandData);

    const middleBandSeries = chart.addLineSeries({
      color: "#2862ff",
      lineWidth: "1",
    });
    middleBandSeries.setData(middleBandData);

    const lowerBandSeries = chart.addLineSeries({
      color: "#0b9981",
      lineWidth: "1",
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

  return (
    <div className="bg-[rgba(0,20,50,1)] w-full justify-center text-center items-center">
      <div className="pt-5 items-center text-center justify-center flex flex-col gap-10">
        <p className="text-white text-6xl font-semibold">
          Stock Performance Overview
        </p>
        <div ref={chartContainerRef} className="h-[600px] w-[90%]" />
      </div>

      <CustomRange
        pricesArray={pricesArray}
        timeIDS={timeIDS}
        interval={props.interval}
        indexArr={props.indexArr}
        setIndexArr={props.setIndexArr}
      />
    </div>
  );
};
