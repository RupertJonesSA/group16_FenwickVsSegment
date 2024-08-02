import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as yup from "yup";
import Axios from "axios";
import searchIcon from "./icons8-search-50.png";
import Select from "react-select";

export const Form = (props) => {
  //Manages the state of URL, apiKey, selectedOption1, and selectedOption2 using React hooks.
  const [URL, setURL] = useState("");
  const apiKey = "KV4FLOY71WHDYJ81";

  const [selectedOption1, setSelectedOption1] = useState(null);
  const [selectedOption2, setSelectedOption2] = useState(null);

  //Fetches data from a specified URL using Axios, logs the data to the console, sets the data in the component's state, handles errors, and updates the loading state.
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

  //Handles form submission by setting the ticker and interval based on the form values.
  const onSubmit = (values, actions) => {
    props.setTicker(values.ticker);
    props.setInterval(selectedOption1?.value);

    if (selectedOption1?.value === "intraday") {
      setURL(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${values.ticker}&interval=5min&outputsize=full&apikey=${apiKey}`,
      );
    } else if (selectedOption1?.value === "daily") {
      setURL(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${values.ticker}&apikey=${apiKey}`,
      );
    } else if (selectedOption1?.value === "weekly") {
      setURL(
        `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${values.ticker}&apikey=${apiKey}`,
      );
    } else if (selectedOption1?.value === "monthly") {
      setURL(
        `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${values.ticker}&apikey=${apiKey}`,
      );
    }
  };

  //Defines a basic schema using Yup for validating an object with ticker and interval properties.
  const basicSchema = yup.object().shape({
    ticker: yup.string().required("Please enter a stock ticker!"),
    interval: yup
      .string()
      .oneOf(["intraday", "daily", "weekly", "monthly"])
      .required(),
  });


   //Destructures values, handleBlur, touched, handleChange, handleSubmit, errors, and isSubmitting from the useFormik hook with the provided initial values, validation schema, and onSubmit function.
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
    },
    validationSchema: basicSchema,
    onSubmit,
  });


  //Options for interval selection.
  const intervalOptions = [
    { value: "intraday", label: "Intraday" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];


  console.log(errors);

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className=" w-[500px] h-40 select-none flex flex-col"
    >
      <div>
        <input
          required={true}
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
        
        {!props.isLoading? (
          props.temp.hasOwnProperty("Error Message") ||
          props.temp.hasOwnProperty("Information") ? (
            <div className="text-center rounded-lg text-red-500 bg-[rgba(0,0,0,0.6)] text-2xl mb-4 font-semibold">
              Please enter a valid stock ticker!
            </div>
          ) : null
        ) : null}
      </div>

      <div className="w-[500px] mb-4 flex justify-center">
        <div>
          <Select
            isSearchable={false}
            className="w-80 text-center rounded-lg text-2xl p-1 cursor-pointer"
            required={true}
            label="Interval"
            name="interval"
            onBlur={handleBlur}
            id="interval"
            type="text"
            placeholder="Interval"
            defaultValue={values.interval}
            onChange={setSelectedOption1}
            options={intervalOptions}
          />
        </div>
      </div>

      {console.log(selectedOption1?.value)}

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
