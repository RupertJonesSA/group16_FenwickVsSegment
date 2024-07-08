import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as yup from "yup";
import "./Form.css";
import Axios from "axios";

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
    <form onSubmit={handleSubmit} autoComplete="off">
      <input
        className={errors.ticker && touched.ticker ? "input-error" : ""}
        value={values.ticker}
        onChange={handleChange}
        onBlur={handleBlur}
        id="ticker"
        type="text"
        placeholder="Stock Ticker"
      />
      {errors.ticker && touched.ticker && <p>{errors.ticker}</p>}
      <select
        label="Interval"
        name="interval"
        value={values.interval}
        onChange={handleChange}
        onBlur={handleBlur}
        id="interval"
        type="text"
        placeholder="Select Interval"
      >
        <option value="intraday">Intraday</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <select
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

      <button type="submit">Submit</button>
    </form>
  );
};
