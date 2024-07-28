import { useEffect, useState } from "react";

const useSegmentTree = (pricesArray, param1, param2) => {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [rsi, setRSI] = useState(null);
  const [cumulativeSum, setCumulativeSum] = useState(null);
  const [intervalAverage, setIntervalAverage] = useState(null);
  const [intervalVariance, setIntervalVariance] = useState(null);
  const [aroonUp, setAroonUp] = useState(null);
  const [aroonDown, setAroonDown] = useState(null);

  // Identify if user has changed the interval of calculation
  useEffect(() => {
    const checkInterval = () => {
      if (param1.current.val !== from) {
        setFrom(param1.current.value);
      }
      if (param2.current.valu !== to) {
        setTo(param2.current.value);
      }
    };

    const intervalId = setInterval(checkInterval, 100);
    return () => clearInterval(intervalId);
  }, [param1, param2, from, to]);

  // Recalculate metrics if interval has changed
  useEffect(() => {
    const wasmModule = require("../../react-wasm/build/segment_implem.js");

    wasmModule.default().then((instance) => {
      // Allocate space in memory for the pricesArray
      const numBytes = pricesArray.length * pricesArray.BYTES_PER_ELEMENT;
      const pricesArrayPtr = instance._malloc(numBytes);

      instance.HEAPF64.set(
        pricesArray,
        pricesArrayPtr / pricesArray.BYTES_PER_ELEMENT,
      );

      // Range is inclusive
      const from = parseInt(param1.current.value);
      const to = parseInt(param2.current.value);

      // Instantiate segmentTree object
      let segTree = new instance.segment_tree(pricesArray.length);
      // Convert Float64Array to vector<double>
      let vectorDouble = new instance.VectorDouble();
      for (let price of pricesArray) {
        vectorDouble.push_back(price);
      }

      segTree.build(vectorDouble);

      // Call all class methods to calculate metrics
      setCumulativeSum(segTree.cumulative_sum(from, to).toFixed(2));
      setIntervalAverage(segTree.interval_average(from, to).toFixed(2));
      setIntervalVariance(segTree.interval_variance(from, to).toFixed(2));
      setAroonUp(segTree.aroon_up(from, to).toFixed(2));
      setAroonDown(segTree.aroon_down(from, to).toFixed(2));

      // Calculate RSI value
      // access stand-alone functions via ccall
      const compute_rsi = instance.ccall(
        "compute_rsi",
        "number",
        ["number", "number", "number", "number"],
        [pricesArrayPtr, from, to, pricesArray.length],
      );

      setRSI(compute_rsi.toFixed(2));
      instance._free(pricesArrayPtr); // deallocate heap memory
    });
  });

  return {
    rsi,
    cumulativeSum,
    intervalAverage,
    intervalVariance,
    aroonUp,
    aroonDown,
  };
};

export default useSegmentTree;
