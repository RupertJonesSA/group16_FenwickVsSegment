
import React, { useEffect, useState, createContext } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useSegmentTree from "./customHooks/useSegmentTree";
import useFenwickTree from "./customHooks/useFenwickTree";

export const DataVis = (props) => {
  const [fenwickTimeTable, setFenwickTimeTable] = useState([]);
  const [segmentTimeTable, setSegmentTimeTable] = useState([]);

  //Registers the provided components with Chart.js
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  );
  


  //Data object containing labels and datasets for a chart.
  const data = {
    labels: [
      "Cumulative Sum",
      "Interval Average",
      "Interval Variance",
      "Interval Standard Deviation",
      "Interval EMA",
      "Interval Kurtosis",
      "Aroon Up",
      "Aroon Down",
    ],
    datasets: [
      {
        label: "Fenwick Tree",
        data: fenwickTimeTable,
        backgroundColor: "rgba(43, 111, 127, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Segment Tree",
        data: segmentTimeTable,
        backgroundColor: "rgba(123, 16, 15, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Options object for configuring a chart display.
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Time Comparison (ms)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const {
    intervalEMA,
    intervalKurtosis,
    cumulativeSum,
    intervalAverage,
    intervalVariance,
    intervalStandardDeviation,
    aroonUp,
    aroonDown,
  } = useSegmentTree(props.dataArray, props.indexArr[0], props.indexArr[1]);

  const {
    fintervalEMA,
    fintervalKurtosis,
    fcumulativeSum,
    fintervalAverage,
    fintervalVariance,
    fintervalStandardDeviation,
    faroonUp,
    faroonDown,
  } = useFenwickTree(props.dataArray, props.indexArr[0], props.indexArr[1]);

  // Update execution display data
  useEffect(() => {
    setFenwickTimeTable([
      fcumulativeSum[1],
      fintervalAverage[1],
      fintervalVariance[1],
      fintervalStandardDeviation[1],
      fintervalEMA[1],
      fintervalKurtosis[1],
      faroonUp[1],
      faroonDown[1],
    ]);

    setSegmentTimeTable([
      cumulativeSum[1],
      intervalAverage[1],
      intervalVariance[1],
      intervalStandardDeviation[1],
      intervalEMA[1],
      intervalKurtosis[1],
      aroonUp[1],
      aroonDown[1],
    ]);
  }, [props.indexArr[0], props.indexArr[1], props.dataArray, cumulativeSum[1]]);


  return (
    <div className="bg-gray-200 w-full flex">
      <div className=" w-[41%] h-[780px] flex flex-row flex-wrap h-[800px] justify-around gap-4 text-gray-400 text-center text-2xl font-semibold mt-5 ml-2">
        <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
          Cumulative Sum
          <p className="text-black text-3xl pt-2">${cumulativeSum[0]} </p>
        </div>
        <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
          Interval Average
          <p className="text-black text-3xl pt-2">${intervalAverage[0]}</p>
        </div>
        <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
          Interval Variance
          <p className="text-black text-3xl pt-2">${intervalVariance[0]}</p>
        </div>
        <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
          Interval STD Deviation
          <p className="text-black text-3xl pt-2">
            ${intervalStandardDeviation[0]}
          </p>
        </div>
        <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
          Interval EMA
          <p className="text-black text-3xl pt-2">${intervalEMA[0]}</p>
        </div>
        <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
          Interval Kurtosis
          <p className="text-black text-3xl pt-2">{intervalKurtosis[0]}</p>
        </div>
        <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
          Aroon up
          <p className="text-black text-3xl pt-2">{aroonUp[0]}%</p>
        </div>
        <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
          Aroon down
          <p className="text-black text-3xl pt-2">{aroonDown[0]}%</p>
        </div>
      </div>
      <div className="w-[58%] h-[780px] mr-3 ml-1">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
