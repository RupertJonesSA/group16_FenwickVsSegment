import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as yup from "yup";
import "./Form.css";
import Axios from "axios";
import searchIcon from './icons8-search-50.png'

export const Form = (props) => {
  const [URL, setURL] = useState("");
  const apiKey = "KL2D3BYFRWKSUUHF";

  const fetchData = () => {
    Axios.get(URL)
      .then((res) => {
        console.log(res.data);
        console.log("done");
        props.setTemp(res.data);
      })
      .catch((error) => {
        alert("Error fetching data:", error);
      })
      .finally(() => {
        props.setIsLoading(false);
      });
  };

  useEffect(() => {
    if (URL) {
      fetchData();
    }
  }, [URL]);

  const onSubmit = (values, actions) => {
    props.setTicker(values.ticker);
    props.setInterval(values.interval);
    props.setDataStruct(values.dataStruct);

    if (values.interval === "intraday") {
      setURL(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${values.ticker}&interval=5min&outputsize=full&apikey=${apiKey}`,
      );
    } else if (values.interval === "daily") {
      setURL(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${values.ticker}&apikey=${apiKey}`,
      );
    } else if (values.interval === "weekly") {
      setURL(
        `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${values.ticker}&apikey=${apiKey}`,
      );
    } else if (values.interval === "monthly") {
      setURL(
        `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${values.ticker}&apikey=${apiKey}`,
      );
    }
  };

  const basicSchema = yup.object().shape({
    ticker: yup.string().required("Please enter a stock ticker!"),
    interval: yup
      .string()
      .oneOf(["intraday", "daily", "weekly", "monthly"])
      .required(),
    dataStruct: yup.string().oneOf(["segment", "fenwick"]).required(),
  });

  const {
    values,
    handleBlur,
    touched,
    handleChange,
    handleSubmit,
    errors,
    isSubmitting,
  } = useFormik({
    initialValues: {
      ticker: "",
      interval: "intraday",
      dataStruct: "fenwick",
    },
    validationSchema: basicSchema,
    onSubmit,
  });

  console.log(errors);

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className=" w-[500px] h-40">
      <div>
        <input
          className="w-full h-24 border rounded-full pl-20 text-3xl outline-0 mb-4 relative cursor-pointer hover:placeholder-black"
          value={values.ticker}
          onChange={handleChange}
          onBlur={handleBlur}
          id="ticker"
          type="text"
          placeholder="Search markets here"
        />
        <div>
          <img src={searchIcon} draggable={false} className="absolute top-8 left-6 w-10"/>
        </div>
        {errors.ticker && touched.ticker && <p className="text-center text-red-700 text-2xl mb-4 font-semibold">{errors.ticker}</p>}
        {!props.isLoading && !errors.ticker ? ((props.temp.hasOwnProperty("Error Message") || props.temp.hasOwnProperty("Information")) ? (<div className="text-center text-red-700 text-2xl mb-4 font-semibold">Invalid</div>) : null) : null}
      </div>

      <div className="flex w-[500px] content-between mb-4">
        <div className="mr-3">
          <select
            className="w-60 text-center rounded-lg text-2xl p-2 bg-blue-700 text-white cursor-pointer"
            label="Interval"
            name="interval"
            value={values.interval}
            onChange={handleChange}
            onBlur={handleBlur}
            id="interval"
            type="text"
            placeholder="Select Interval"
          >
            <option value="intraday" className="bg-gray-500 rounded-full hover:bg-gray-500">Intraday</option>
            <option value="daily" className="bg-gray-500">Daily</option>
            <option value="weekly" className="bg-gray-500">Weekly</option>
            <option value="monthly" className="bg-gray-500">Monthly</option>
          </select>
        </div>

        <div className="">
            <select
          className="w-60 text-center rounded-full text-2xl p-1 cursor-pointer"
            label="dataStruct"
            name="dataStruct"
            value={values.dataStruct}
            onChange={handleChange}
            onBlur={handleBlur}
            id="dataStruct"
            type="text"
            placeholder="Select Data Structure"
          >
            <option value="fenwick">Fenwick Tree</option>
            <option value="segment">Segment Tree</option>
          </select>
        </div>
      </div>

      <div className="text-center">
        <button type="submit" className="	bg-white text-2xl p-5 rounded-full">Submit</button>
      </div>
    </form>
  );
};
