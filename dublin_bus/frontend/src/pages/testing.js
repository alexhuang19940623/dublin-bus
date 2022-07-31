import React, { useState } from "react";
import { getForecastWeather, getMLPrediction, getSixteenDay } from "../lib/api";

export function Testing() {
  const handlePrediction = async () => {
    try {
      const { data } = await getMLPrediction(
        "Outside Train Station - Phoenix Park Gate",
        "46A",
        75,
        5.1,
        19800,
        1,
        10
      );
      console.log("prediction", data[0]);
    } catch (e) {
      console.log(e);
    }
  };

  const handleWeather = async () => {
    try {
      const res = await getForecastWeather();
      console.log("weather", res);
    } catch (e) {
      console.log(e);
    }
  };
  //        [75, 5.1, 19800, 1, 10]

  return (
    <>
      <button
        onClick={handlePrediction}
        className='p-2 rounded-lg bg-primary-blue m-4'
      >
        Get prediction
      </button>
      <button
        onClick={handleWeather}
        className='p-2 rounded-lg bg-primary-blue m-4'
      >
        Get 16 day weather
      </button>
    </>
  );
}
