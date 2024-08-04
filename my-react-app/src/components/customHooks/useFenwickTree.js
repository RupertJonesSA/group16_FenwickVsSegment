import { useEffect, useState, useRef } from "react";

const useFenwickTree = (pricesArray, param1, param2) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(pricesArray.length);
  const [fintervalEMA, setIntervalEMA] = useState([0, 0]);
  const [fintervalKurtosis, setIntervalKurtosis] = useState([0, 0]);
  const [fcumulativeSum, setCumulativeSum] = useState([0, 0]);
  const [fintervalAverage, setIntervalAverage] = useState([0, 0]);
  const [fintervalVariance, setIntervalVariance] = useState([0, 0]);
  const [fintervalStandardDeviation, setStandardDeviation] = useState([0, 0]);
  const [faroonUp, setAroonUp] = useState([0, 0]);
  const [faroonDown, setAroonDown] = useState([0, 0]);

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

    const averageTime = totalTime / numRuns;
    return averageTime;
  };

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

        // Instantiate fenwick Tree object
        let fenwickTree = new instance.fenwick_tree(vectorDouble);

        let from = parseInt(param1);
        let to = parseInt(param2);

        if (from < 0 || isNaN(from)) {
          from = 0;
        }
        if (to < 0 || isNaN(to)) {
          to = pricesArray.length - 1;
        }

        // Call all class methods to calculate metrics. Use performance module to calculate execution time
        const computedEMA = fenwickTree.interval_ema(from, to).toFixed(2);
        const emaTime = benchmarkMethod(fenwickTree, "interval_ema", [
          from,
          to,
        ]);
        console.log(emaTime);

        const computedKurtosis = fenwickTree
          .interval_kurtosis(from, to)
          .toFixed(2);
        const kurtosisTime = benchmarkMethod(fenwickTree, "interval_kurtosis", [
          from,
          to,
        ]);

        const computedSum = fenwickTree.cumulative_sum(from, to).toFixed(2);
        const sumTime = benchmarkMethod(fenwickTree, "cumulative_sum", [
          from,
          to,
        ]);

        const computedAverage = fenwickTree
          .interval_average(from, to)
          .toFixed(2);
        const averageTime = benchmarkMethod(fenwickTree, "interval_average", [
          from,
          to,
        ]);

        const computedVariance = fenwickTree
          .interval_variance(from, to)
          .toFixed(2);
        const varianceTime = benchmarkMethod(fenwickTree, "interval_variance", [
          from,
          to,
        ]);

        const computedStandard = fenwickTree
          .interval_standard_deviation(from, to)
          .toFixed(2);
        const standardTime = benchmarkMethod(
          fenwickTree,
          "interval_standard_deviation",
          [from, to],
        );

        const computedAroonUp = fenwickTree.aroon_up(from, to).toFixed(2);
        const aroonUpTime = benchmarkMethod(fenwickTree, "aroon_up", [
          from,
          to,
        ]);

        const computedAroonDown = fenwickTree.aroon_down(from, to).toFixed(2);
        const aroonDownTime = benchmarkMethod(fenwickTree, "aroon_down", [
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
        fenwickTree.delete();
        vectorDouble.delete();

        instance = null; // allow for garbage collection of instance
      } catch (error) {
        console.error("Error loading fenwick tree wasm module", error);
      }
    };

    loadWasm();
  }, [pricesArray, param1, param2]);

  return {
    fintervalEMA,
    fintervalKurtosis,
    fcumulativeSum,
    fintervalAverage,
    fintervalVariance,
    fintervalStandardDeviation,
    faroonUp,
    faroonDown,
  };
};

export default useFenwickTree;
