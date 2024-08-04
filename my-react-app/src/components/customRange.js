import React, { useEffect, useRef, useState } from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TextField } from "@mui/material";
import dayjs from "dayjs";
import { Grid } from "@mui/material";

export const CustomRange = (props) => {
  //Initializes state variables for daily, intraday, weekly, and monthly ranges.
  const [dailyRange1, setDailyRange1] = useState("");
  const [dailyRange2, setDailyRange2] = useState("");

  const [intradayRange1, setIntradayRange1] = useState("");
  const [intradayRange2, setIntradayRange2] = useState("");

  const [weekRange1, setWeekRange1] = useState("");
  const [weekRange2, setWeekRange2] = useState("");

  const [monthRange1, setMonthRange1] = useState("");
  const [monthRange2, setMonthRange2] = useState("");

  const timeArr = props.timeIDS;
  const interval = "daily";
  const indexArr = props.indexArr;
  const setIndexArr = props.setIndexArr;

  //Calculates the minimum date from the given timeArr and returns it in a specific format.
  const calcMin = () => {
    const minDate = new Date(timeArr[0] * 1000);
    return JSON.stringify(minDate).substring(1, 11);
  };

  //Calculates the maximum date from the given array of timestamps and returns it in a specific format.
  const calcMax = () => {
    const maxDate = new Date(timeArr[timeArr.length - 1] * 1000);
    return JSON.stringify(maxDate).substring(1, 11);
  };

  //Calculates the maximum monthly value based on the last element in the timeArr array.
  const calcMaxMonthly = () => {
    const maxDate = new Date(timeArr[timeArr.length - 1] * 1000);
    return JSON.stringify(maxDate).substring(1, 8);
  };

  //Calculates the minimum monthly value based on the first element of the timeArr array.
  const calcMinMonthly = () => {
    const mixDate = new Date(timeArr[0] * 1000);
    return JSON.stringify(mixDate).substring(1, 8);
  };

  //Get the range of the week for a given date.
  const getWeekRange = (date) => {
    const endOfWeek = date.endOf("week").subtract(1, "day");
    const normalDate = new Date(timeArr[timeArr.length - 1] * 1000);
    if (Date.parse(endOfWeek) / 1000 > timeArr[timeArr.length - 1]) {
      return JSON.stringify(normalDate).substring(1, 11);
    } else {
      return `${endOfWeek.format("YYYY-MM-DD")}`;
    }
  };

  //Get the month range for a given date.
  const getMonthRange = (date) => {
    const tempMonth = date.$d.toJSON().substring(0, 7);

    for (let i = 0; i < timeArr.length; i++) {
      const normalDate = new Date(timeArr[i] * 1000);
      const tempDate = JSON.stringify(normalDate).substring(1, 8);
      if (String(tempDate) === String(tempMonth)) {
        return normalDate.toISOString().split("T")[0];
      }
    }
    return "No match found";
  };

  //Handles the date change based on the selected interval.
  //Updates the range based on the interval selected.
  const handleDateChange1 = (date) => {
    if (interval === "weekly") {
      setWeekRange1(getWeekRange(date));
    } else if (interval === "monthly") {
      setMonthRange1(getMonthRange(date));
    } else if (interval === "daily") {
      setDailyRange1(JSON.stringify(date).substring(1, 11));
    } else if (interval === "intraday") {
      setIntradayRange1(String(date.$d).substring(0, 21));
    }
  };

  //Handles the date change based on the selected interval.
  //Updates the range based on the interval selected.
  const handleDateChange2 = (date) => {
    if (interval === "weekly") {
      setWeekRange2(getWeekRange(date));
    } else if (interval === "monthly") {
      setMonthRange2(getMonthRange(date));
    } else if (interval === "daily") {
      setDailyRange2(JSON.stringify(date).substring(1, 11));
    } else if (interval === "intraday") {
      setIntradayRange2(String(date.$d).substring(0, 21));
    }
  };

  //Disable a specific time based on the view (hours or minutes).
  const disableTime = (dateTime, view) => {
    if (view === "hours") {
      return !availableTimeSlots[dateTime.format("YYYY-MM-DD")]?.some(
        (slot) => slot.hour === dateTime.hour(),
      );
    }
    if (view === "minutes") {
      const currentHourSlots = availableTimeSlots[
        dateTime.format("YYYY-MM-DD")
      ]?.filter((slot) => slot.hour === dateTime.hour());
      return !currentHourSlots?.some(
        (slot) => slot.minute === dateTime.minute(),
      );
    }
    return false;
  };

  //Calculates the index of a given range in the timeArr array.
  const calcIndex = (range) => {
    const tempDate = Date.parse(range) / 1000;
    for (let i = 0; i < timeArr.length; i++) {
      if (tempDate === timeArr[i]) {
        return i;
      }
    }
    return -1;
  };

  //Defines a custom style object for a form component with specific CSS properties.
  const style = {
    "& label": {
      color: "white",
    },
    "& label.Mui-focused": {
      color: "white",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "white",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "white",
      },
      "&:hover fieldset": {
        borderColor: "white",
      },
      "&.Mui-focused fieldset": {
        borderColor: "white",
      },
    },
    "& .MuiInputBase-input": {
      color: "white",
    },
    "& .MuiButtonBase-root": {
      color: "orange",
    },
  };

  //Handles the submission of form data and calculates the indices based on the selected interval.
  const handleSubmit = () => {
    const indecies = [0, 0];
    if (interval === "intraday") {
      indecies[0] = calcIndex(intradayRange1);
      indecies[1] = calcIndex(intradayRange2);
    } else if (interval === "daily") {
      indecies[0] = calcIndex(dailyRange1);
      indecies[1] = calcIndex(dailyRange2);
    } else if (interval === "weekly") {
      indecies[0] = calcIndex(weekRange1);
      indecies[1] = calcIndex(weekRange2);
    } else if (interval === "monthly") {
      indecies[0] = calcIndex(monthRange1);
      indecies[1] = calcIndex(monthRange2);
    }
    //console.log(indecies);
    return indecies;
  };

  const [isOn, setIsOn] = useState(false);

  /*console.log(calcIndex(intradayRange1));
  console.log(calcIndex(intradayRange2));
  console.log(indexArr);*/

  //Converts an array of timestamps into an array of dates in the format 'YYYY-MM-DD'.
  const daysAllowed = () => {
    const tempData = timeArr.map((i) => new Date(i * 1000));
    const availableDates = tempData.map((i) =>
      JSON.stringify(i).substring(1, 11),
    );
    return availableDates;
  };

  //Converts an array of timestamps into an object with date strings as keys and an array of hour and minute objects as values.
  const timeAllowed = () => {
    const dateStrings = timeArr.map((timestamp) =>
      new Date(timestamp * 1000).toISOString(),
    );

    //console.log(dateStrings);
    const availableTimeSlots = dateStrings.reduce((acc, timestamp) => {
      const date = new Date(timestamp);
      const dateString = date.toISOString().split("T")[0]; // Extract the date part in YYYY-MM-DD format
      const hour = date.getUTCHours();
      const minute = date.getUTCMinutes();

      if (!acc[dateString]) {
        acc[dateString] = [];
      }

      acc[dateString].push({ hour, minute });

      return acc;
    }, {});

    return availableTimeSlots;
  };

  const availableTimeSlots = timeAllowed();

  return (
    <div>
      <button
        onClick={() => setIsOn(!isOn)}
        className="bg-white rounded-lg w-[300px] h-20 text-3xl font-semibold text-gray-400 mt-10 mb-10 hover:text-black"
      >
        Custom Range{" "}
        {isOn ? (
          <span className="text-3xl">&#x25B2;</span>
        ) : (
          <span className="text-2xl">&#x25BC;</span>
        )}
      </button>
      {isOn ? (
        <div className="flex flex-col justify-center gap-5 text-center text-2xl font-semibold text-white items-center">
          <p className="text-3xl">Choose Date Boundaries</p>
          <div className="flex flex-row justify-center gap-3">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker", "DateTimePicker"]}>
                {interval === "daily" ? (
                  <div className="flex flex-row gap-3">
                    <DatePicker
                      label="Lower Bound"
                      sx={style}
                      onChange={handleDateChange1}
                      minDate={dayjs(calcMin())}
                      maxDate={dayjs(calcMax())}
                      shouldDisableDate={(date) =>
                        !daysAllowed().some((availableDate) =>
                          date.isSame(dayjs(availableDate), "day"),
                        )
                      }
                    />
                    <DatePicker
                      label="Upper Bound"
                      sx={style}
                      onChange={handleDateChange2}
                      minDate={dayjs(calcMin())}
                      maxDate={dayjs(calcMax())}
                      shouldDisableDate={(date) =>
                        !daysAllowed().some((availableDate) =>
                          date.isSame(dayjs(availableDate), "day"),
                        )
                      }
                    />
                  </div>
                ) : interval === "weekly" ? (
                  <div className="flex flex-row gap-3">
                    <DatePicker
                      label="Lower Bound"
                      onChange={handleDateChange1}
                      sx={style}
                      minDate={dayjs(calcMin())}
                      maxDate={dayjs(calcMax())}
                      shouldDisableDate={(date) =>
                        !daysAllowed().some((availableDate) =>
                          date.isSame(dayjs(availableDate), "day"),
                        )
                      }
                    />
                    <DatePicker
                      label="Upper Bound"
                      onChange={handleDateChange2}
                      sx={style}
                      minDate={dayjs(calcMin())}
                      maxDate={dayjs(calcMax())}
                      shouldDisableDate={(date) =>
                        !daysAllowed().some((availableDate) =>
                          date.isSame(dayjs(availableDate), "day"),
                        )
                      }
                    />
                  </div>
                ) : interval === "monthly" ? (
                  <Grid container justifyContent="center" alignItems="center">
                    <Grid item>
                      <div className="flex flex-row gap-3">
                        <DatePicker
                          views={["year", "month"]}
                          label="Lower Bound"
                          format="YYYY-MM"
                          onChange={handleDateChange1}
                          sx={style}
                          minDate={dayjs(calcMinMonthly())}
                          maxDate={dayjs(calcMaxMonthly())}
                        />
                        <DatePicker
                          views={["year", "month"]}
                          label="Upper Bound"
                          format="YYYY-MM"
                          onChange={handleDateChange2}
                          sx={style}
                          minDate={dayjs(calcMinMonthly())}
                          maxDate={dayjs(calcMaxMonthly())}
                        />
                      </div>
                    </Grid>
                  </Grid>
                ) : interval === "intraday" ? (
                  <div className="flex flex-row gap-3">
                    <DateTimePicker
                      label="Lower Bound"
                      sx={style}
                      onChange={handleDateChange1}
                      minDate={dayjs(calcMin())}
                      maxDate={dayjs(calcMax())}
                      shouldDisableTime={disableTime}
                      shouldDisableDate={(date) =>
                        !daysAllowed().some((availableDate) =>
                          date.isSame(dayjs(availableDate), "day"),
                        )
                      }
                    />
                    <DateTimePicker
                      label="Upper Bound"
                      sx={style}
                      onChange={handleDateChange2}
                      minDate={dayjs(calcMin())}
                      maxDate={dayjs(calcMax())}
                      shouldDisableTime={disableTime}
                      shouldDisableDate={(date) =>
                        !daysAllowed().some((availableDate) =>
                          date.isSame(dayjs(availableDate), "day"),
                        )
                      }
                    />
                  </div>
                ) : null}
              </DemoContainer>
            </LocalizationProvider>
          </div>

          <div className="flex justify-center mb-10 flex-col gap-7">
            <button
              onClick={() => setIndexArr(handleSubmit)}
              className="font-normal bg-white text-gray-400 w-[200px] h-[50px] rounded-lg hover:text-black"
            >
              Calculate
            </button>
            <button
              onClick={() => setIndexArr([0, timeArr.length - 1])}
              className="text-gray-400 text-sm underline hover:text-white"
            >
              Reset Bounds
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
