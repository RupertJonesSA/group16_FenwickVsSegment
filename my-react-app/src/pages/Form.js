import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as yup from "yup";
import "./Form.css";
import Axios from "axios";
import searchIcon from "./icons8-search-50.png";
import Select from "react-select";

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

  const [selectedOption, setSelectedOption] = useState(null);

  const intervalOptions = [
    { value: "intraday", label: "Intraday" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const structOptions = [
    { value: "fenwick", label: "Fenwick Tree" },
    { value: "segment", label: "Segment Tree" },
  ];

  console.log(errors);

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className=" w-[500px] h-40 select-none"
    >
      <div>
        <input
          className="w-full h-16 border rounded-lg pl-20 text-3xl outline-0 mb-4 relative cursor-pointer hover:placeholder-black"
          value={values.ticker}
          onChange={handleChange}
          onBlur={handleBlur}
          id="ticker"
          type="text"
          placeholder="Search markets here"
        />
        <div>
          <img
            src={searchIcon}
            draggable={false}
            className="absolute top-3 left-4 w-10"
          />
        </div>
        {errors.ticker && touched.ticker && (
          <p className="text-center text-red-700 text-2xl mb-4 font-semibold">
            {errors.ticker}
          </p>
        )}
        {!props.isLoading && !errors.ticker ? (
          props.temp.hasOwnProperty("Error Message") ||
          props.temp.hasOwnProperty("Information") ? (
            <div className="text-center text-red-700 text-2xl mb-4 font-semibold">
              Invalid
            </div>
          ) : null
        ) : null}
      </div>

      <div className="flex w-[500px] content-between mb-4">
        <div className="mr-3">
          <Select
            className="w-60 text-center rounded-lg text-2xl p-1 cursor-pointer"
            label="Interval"
            name="interval"
            onBlur={handleBlur}
            id="interval"
            type="text"
            placeholder="Interval"
            defaultValue={values.interval}
            onChange={[setSelectedOption, handleChange]}
            options={intervalOptions}
          />
        </div>
        <div>
          <Select
            className="w-60 text-center rounded-lg text-2xl p-1 cursor-pointer"
            label="dataStruct"
            name="dataStruct"
            value={values.dataStruct}
            onChange={handleChange}
            onBlur={handleBlur}
            id="dataStruct"
            type="text"
            placeholder="Data Structure"
            options={structOptions}
          />
        </div>
      </div>

      <div className="text-center">
        <button
          type="submit"
          className="	bg-white text-2xl p-4 w-52 rounded-lg text-gray-500 hover:text-black"
        >
          Submit
        </button>
      </div>
    </form>
  );
};
