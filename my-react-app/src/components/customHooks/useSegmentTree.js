import { useEffect, useState } from "react";

const useSegmentTree = (pricesArray, param1, param2) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(pricesArray.length);
  const [rsi, setRSI] = useState([]);
  const [cumulativeSum, setCumulativeSum] = useState([]);
  const [intervalAverage, setIntervalAverage] = useState([]);
  const [intervalVariance, setIntervalVariance] = useState([]);
  const [intervalStandardDeviation, setStandardDeviation] = useState([]);
  const [aroonUp, setAroonUp] = useState([]);
  const [aroonDown, setAroonDown] = useState([]);

  // Identify if user has changed the interval of calculation
  useEffect(() => {
    const checkInterval = () => {
      if (
        param1.current.value !== 0 &&
        !isNaN(param1.current.value) &&
        param1.current.value !== from
      ) {
        setFrom(param1.current.value);
      }
      if (
        param2.current.value !== 0 &&
        !isNaN(param2.current.value) &&
        param2.current.value !== to
      ) {
        setTo(param2.current.value);
      }
    };

    const intervalId = setInterval(checkInterval, 100);
    return () => clearInterval(intervalId);
  }, [param1, param2, from, to]);

  // Recalculate metrics if interval has changed
  useEffect(() => {
    const loadWasm = async () => {
      try{
        const wasmModule = require("../../react-wasm/build/segment_implem.js");
        let instance = await wasmModule.default();

        // Instantiate segmentTree object
        let segmentTree = new instance.segment_tree(pricesArray.length);

        // Convert Float64Array to vector<double>
        let vectorDouble = new instance.VectorDouble();
        for (let price of pricesArray) {
          vectorDouble.push_back(price);
        }

        segmentTree.build(vectorDouble);
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
        
        const computedSum = segmentTree.cumulative_sum(from, to).toFixed(2);
        const sumTime = performance.now() - startTime;
        startTime = performance.now();

        const computedAverage = segmentTree.interval_average(from, to).toFixed(2);
        const averageTime = performance.now() - startTime;
        startTime = performance.now();

        const computedVariance = segmentTree.interval_variance(from, to).toFixed(2);
        const varianceTime = performance.now() - startTime;
        startTime = performance.now();

        const computedStandard = segmentTree.interval_standard_deviation(from, to);
        const standardTime = performance.now() - startTime;
        startTime = performance.now();

        const computedAroonUp = segmentTree.aroon_up(from, to).toFixed(2);
        const aroonUpTime = performance.now() - startTime;
        startTime = performance.now(); 

        const computedAroonDown = segmentTree.aroon_down(from, to).toFixed(2); 
        const aroonDownTime = performance.now() - startTime;
        
        setRSI([computedRSI, rsiTime]);
        setIntervalAverage([computedAverage, averageTime]);
        setCumulativeSum([computedSum, sumTime]);
        setIntervalVariance([computedVariance, varianceTime]);
        setStandardDeviation([computedStandard, standardTime]);
        setAroonUp([computedAroonUp, aroonUpTime]);
        setAroonDown([computedAroonDown, aroonDownTime]); 
        
        // Must delete instance of segment tree before calling compute_rsi as the function
        // utilizes two segment trees to perform the necessary calculations optimally. Due to the
        // limited heap size of web assembly, if the instance is not deleted, then a heap overflow will occur
        segmentTree.delete();
        vectorDouble.delete();         

        instance = null; // allow for garbage collection of instance
      }catch(error){
        console.log("Error loading segment tree wasm module", error);
      }
    };

    loadWasm();
  }, [pricesArray, from, to, param1, param2]);

  return {
    rsi,
    cumulativeSum,
    intervalAverage,
    intervalVariance,
    intervalStandardDeviation,
    aroonUp,
    aroonDown,
  };
};

export default useSegmentTree;
