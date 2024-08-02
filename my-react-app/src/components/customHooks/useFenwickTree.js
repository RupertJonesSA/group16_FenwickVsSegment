import { useEffect, useState, useRef } from "react";

const useFenwickTree = (pricesArray, param1, param2) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(pricesArray.length);
  const [frsi, setRSI] = useState([]);
  const [fcumulativeSum, setCumulativeSum] = useState([]);
  const [fintervalAverage, setIntervalAverage] = useState([]);
  const [fintervalVariance, setIntervalVariance] = useState([]);
  const [fintervalStandardDeviation, setStandardDeviation] = useState([]);
  const [faroonUp, setAroonUp] = useState([]);
  const [faroonDown, setAroonDown] = useState([]);

  //Identify if user has changed the interval of calculation
  useEffect(() => {
    const checkInterval = () => {
      if (
        param1.current?.value !== 0 &&
        !isNaN(param1.current?.value) &&
        param1.current?.value !== from
      ) {
        setFrom(param1.current?.value);
      }
      if (
        param2.current?.value !== 0 &&
        !isNaN(param2.current?.value) &&
        param2.current?.value !== to
      ) {
        setTo(param2.current?.value);
      }
    };

    const intervalId = setInterval(checkInterval, 100);
    return () => clearInterval(intervalId);
  }, [param1, param2, from, to]);

  // Recalculate metrics if interval has changed
  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasmModule = require("../../react-wasm/build/fenwick_tree_implem.js");
        let instance = await wasmModule.default();

        // Convert Float64Array to vector<double>
        let vectorDouble = new instance.VectorDouble();
        for (let price of pricesArray) {
          vectorDouble.push_back(price);
        }

        // Instantiate segmentTree object
        let fenwickTree = new instance.fenwick_tree(vectorDouble);

        let from = parseInt(param1.current.value);
        let to = parseInt(param2.current.value);

        if (from < 0 || isNaN(from)) {
          from = 0;
        }
        if (to < 0 || isNaN(to)) {
          to = pricesArray.length - 1;
        }

        // Call all class methods to calculate metrics. Use performance module to calculate execution time
        let startTime = performance.now();

        const computedRSI = instance.compute_interval_rsi(vectorDouble, from, to, pricesArray.length).toFixed(2);
        const rsiTime = performance.now() - startTime;
        startTime = performance.now();
        
        const computedSum = fenwickTree.cumulative_sum(from, to).toFixed(2);
        const sumTime = performance.now() - startTime;
        startTime = performance.now();

        const computedAverage = fenwickTree.interval_average(from, to).toFixed(2);
        const averageTime = performance.now() - startTime;
        startTime = performance.now();

        const computedVariance = fenwickTree.interval_variance(from, to).toFixed(2);
        const varianceTime = performance.now() - startTime;
        startTime = performance.now();

        const computedStandard = fenwickTree.interval_standard_deviation(from, to);
        const standardTime = performance.now() - startTime;
        startTime = performance.now();

        const computedAroonUp = fenwickTree.aroon_up(from, to).toFixed(2);
        const aroonUpTime = performance.now() - startTime;
        startTime = performance.now(); 

        const computedAroonDown = fenwickTree.aroon_down(from, to).toFixed(2); 
        const aroonDownTime = performance.now() - startTime;
        
        setRSI([computedRSI, rsiTime]);
        setIntervalAverage([computedAverage, averageTime]);
        setCumulativeSum([computedSum, sumTime]);
        setIntervalVariance([computedVariance, varianceTime]);
        setStandardDeviation([computedStandard, standardTime]);
        setAroonUp([computedAroonUp, aroonUpTime]);
        setAroonDown([computedAroonDown, aroonDownTime]);
        
        // Must delete instance of fenwick tree before calling compute_rsi as the function
        // utilizes two fenwick trees to perform the necessary calculations optimally. Due to the
        // limited heap size of web assembly, if the instance is not deleted, then a heap overflow will occur
        fenwickTree.delete(); 
        vectorDouble.delete();

        instance = null; // allow for garbage collection of instance
      } catch (error) {
        console.error("Error loading fenwick tree wasm module", error);
      }
    };

    loadWasm();
  }, [pricesArray, from, to, param1, param2]);

  return {
    frsi,
    fcumulativeSum,
    fintervalAverage,
    fintervalVariance,
    fintervalStandardDeviation,
    faroonUp,
    faroonDown,
  };
};

export default useFenwickTree;
