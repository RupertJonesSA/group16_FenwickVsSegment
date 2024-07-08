import React, { useEffect, useRef, useState, createContext } from 'react';
import { createChart } from 'lightweight-charts';
import info from "c:/Users/thebl/Documents/React/my-react-app/src/pages/data";

export const Graph = (props) => {
	const chartContainerRef = useRef();


  useEffect(() => {
    const chartOptions = {
      layout: { textColor: 'white', background: { type: 'solid', color: 'black' } }
    };
    const chart = createChart(chartContainerRef.current, chartOptions);
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350'
    });

    const timeSeries = info["Time Series (5min)"];

    const transformedData = Object.keys(timeSeries).map(key => {
      const { 
          "1. open": open, 
          "2. high": high, 
          "3. low": low, 
          "4. close": close 
      } = timeSeries[key];
  
      return {
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
          time: Date.parse(key) / 1000
      };
  });


    const data = transformedData.sort((a, b) => a.time - b.time);;

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div>
      <div ref={chartContainerRef} className='test' />
    </div>
  );
}