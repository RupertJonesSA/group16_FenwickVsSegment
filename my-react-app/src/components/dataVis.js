import React, { useEffect, useState, createContext } from "react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

export const DataVis = () =>{

    //Registers the provided components with Chart.js
    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

    

        //Data object containing labels and datasets for a chart.
        const data = {
          labels: ['Cumulative Sum', 'Interval Average', 'Interval Minimum', 'Interval Maximum', 'Interval Variance', 'Aroon Up', 'Aroon down', 'Relative Strength Index'],
          datasets: [
            {
              label: 'Fenwick Tree',
              data: [25, 15, 30, 20, 10, 30, 10, 25],
              backgroundColor: 'rgba(43, 111, 127, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            {
              label: 'Segment Tree',
              data: [15, 5, 20, 10, 5, 20, 15, 30, 10],
              backgroundColor: 'rgba(123, 16, 15, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        };
      
        // Options object for configuring a chart display.
        const options = {
        maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Time Comparison (ms)',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        };
      
    


    return(
        <div className="bg-gray-200 w-full flex">
            <div className=" w-[41%] h-[780px] flex flex-row flex-wrap h-[800px] justify-around gap-4 text-gray-400 text-center text-2xl font-semibold mt-5 ml-2">
                <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
                    Cumulative Sum
                    <p className="text-black text-3xl pt-2">$172</p>
                </div>
                <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
                    Interval Average
                    <p className="text-black text-3xl pt-2">$183</p>
                </div>
                <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
                    Interval Minimum
                    <p className="text-black text-3xl pt-2">$165</p>
                </div>
                <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
                    Interval Maximum
                    <p className="text-black text-3xl pt-2">$194</p>
                </div>
                <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
                    Interval Variance
                    <p className="text-black text-3xl pt-2">$177</p>
                </div>
                <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
                    Aroon Up
                    <p className="text-black text-3xl pt-2">$183</p>
                </div>
                <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
                    Aroon down
                    <p className="text-black text-3xl pt-2">$191</p>
                </div>
                <div className="bg-[white] w-72 h-28 rounded-xl flex flex-col justify-center shadow-2xl">
                    Relative Strength Index
                    <p className="text-black text-3xl pt-2">$186</p>
                </div>
            </div>
            <div className="w-[58%] h-[780px] mr-3 ml-1">
                <Bar data={data} options={options}/>
            </div>
        </div>
    )
}