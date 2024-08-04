import { useEffect, useState, useRef } from "react";

const useSegmentTree = (pricesArray, param1, param2) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(pricesArray.length);
  const [intervalEMA, setIntervalEMA] = useState([0, 0]);
  const [intervalKurtosis, setIntervalKurtosis] = useState([0, 0]);
  const [cumulativeSum, setCumulativeSum] = useState([0, 0]);
  const [intervalAverage, setIntervalAverage] = useState([0, 0]);
  const [intervalVariance, setIntervalVariance] = useState([0, 0]);
  const [intervalStandardDeviation, setStandardDeviation] = useState([0, 0]);
  const [aroonUp, setAroonUp] = useState([0, 0]);
  const [aroonDown, setAroonDown] = useState([0, 0]);

  // Function calculates execution time in milliseconds using javascript performance library
  const measureExecutionTime = (func, iterations) => {
    const start = performance.now();
    for (let i = 0; i < iterations; ++i) {
      func();
    }
    const end = performance.now();
    return end - start;
  };

  // Function executes a method from the fenwick tree class a predetermined amount of times, measures time of each execute, and
  // returns the average aggregate execution time.
  const benchmarkMethod = (instance, methodName, args, numRuns = 10) => {
    let totalTime = 0;

    for (let i = 0; i < numRuns; i++) {
      totalTime += measureExecutionTime(() => {
        instance[methodName](...args);
      }, 1000);
    }
    console.log(totalTime);
    const averageTime = totalTime / numRuns;
    return averageTime;
  };

  // Recalculate metrics if interval has changed
  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasmModule = require("../../react-wasm/build/segment_implem.js");
        let instance = await wasmModule.default();

        // Convert Float64Array to vector<double>
        let vectorDouble = new instance.VectorDouble();
        for (let price of pricesArray) {
          vectorDouble.push_back(price);
        }

        // Instantiate segmentTree object
        let segmentTree = new instance.segment_tree(pricesArray.length);
        segmentTree.build(vectorDouble);

        let from = parseInt(param1);
        let to = parseInt(param2);

        if (from < 0 || isNaN(from)) {
          from = 0;
        }
        if (to < 0 || isNaN(to)) {
          to = pricesArray.length - 1;
        }

        // Call all class methods to calculate metrics. Use performance module to calculate execution time
        const computedEMA = segmentTree.interval_ema(from, to).toFixed(2);
        const emaTime = benchmarkMethod(segmentTree, "interval_ema", [
          from,
          to,
        ]);

        const computedKurtosis = segmentTree
          .interval_kurtosis(from, to)
          .toFixed(2);
        const kurtosisTime = benchmarkMethod(segmentTree, "interval_kurtosis", [
          from,
          to,
        ]);

        const computedSum = segmentTree.cumulative_sum(from, to).toFixed(2);
        const sumTime = benchmarkMethod(segmentTree, "cumulative_sum", [
          from,
          to,
        ]);

        const computedAverage = segmentTree
          .interval_average(from, to)
          .toFixed(2);
        const averageTime = benchmarkMethod(segmentTree, "interval_average", [
          from,
          to,
        ]);

        const computedVariance = segmentTree
          .interval_variance(from, to)
          .toFixed(2);
        const varianceTime = benchmarkMethod(segmentTree, "interval_variance", [
          from,
          to,
        ]);

        const computedStandard = segmentTree
          .interval_standard_deviation(from, to)
          .toFixed(2);
        const standardTime = benchmarkMethod(
          segmentTree,
          "interval_standard_deviation",
          [from, to],
        );

        const computedAroonUp = segmentTree.aroon_up(from, to).toFixed(2);
        const aroonUpTime = benchmarkMethod(segmentTree, "aroon_up", [
          from,
          to,
        ]);

        const computedAroonDown = segmentTree.aroon_down(from, to).toFixed(2);
        const aroonDownTime = benchmarkMethod(segmentTree, "aroon_down", [
          from,
          to,
        ]);

        setIntervalEMA([computedEMA, emaTime]);
        setIntervalKurtosis([computedKurtosis, kurtosisTime]);
        setIntervalAverage([computedAverage, averageTime]);
        setCumulativeSum([computedSum, sumTime]);
        setIntervalVariance([computedVariance, varianceTime]);
        setStandardDeviation([computedStandard, standardTime]);
        setAroonUp([computedAroonUp, aroonUpTime]);
        setAroonDown([computedAroonDown, aroonDownTime]);

        // Must delete instance of fenwick tree before calling compute_rsi as the function
        // utilizes two fenwick trees to perform the necessary calculations optimally. Due to the
        // limited heap size of web assembly, if the instance is not deleted, then a heap overflow will occur
        segmentTree.delete();
        vectorDouble.delete();

        instance = null; // allow for garbage collection of instance
      } catch (error) {
        console.error("Error loading segment tree wasm module", error);
      }
    };

    loadWasm();
  }, [pricesArray, param1, param2]);

  return {
    intervalEMA,
    intervalKurtosis,
    cumulativeSum,
    intervalAverage,
    intervalVariance,
    intervalStandardDeviation,
    aroonUp,
    aroonDown,
  };
};

export default useSegmentTree;
