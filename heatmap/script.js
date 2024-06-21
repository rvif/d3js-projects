let url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
let req = new XMLHttpRequest();

let baseTemp;
let values = [];

let xScale;
let yScale;

let minYear, maxYear;
let numberOfYear;

let width = 1200,
  height = 600,
  padding = 60;

let canvas = d3.select("#canvas").attr("width", width).attr("height", height);

let tooltip = d3.select("#tooltip");

let generateScales = () => {
  minYear = d3.min(values, (item) => {
    return item["year"];
  });

  maxYear = d3.max(values, (item) => {
    return item["year"];
  });

  xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear + 1])
    .range([padding, width - padding]);

  yScale = d3
    .scaleTime()
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
    .range([padding, height - padding]);
};

let drawCells = () => {
  // bind individual rect's to value's element / binding rects to dataset
  canvas
    .selectAll("rect")
    .data(values)
    .enter() // enter() is used to define what has to be done for elements in dataset for which rect doesn't exists
    .append("rect")
    .attr("class", "cell")
    .attr("fill", (item) => {
      variance = item["variance"];
      if (variance <= -1) {
        return "SteelBlue";
      } else if (variance <= 0) {
        return "LightSteelBlue";
      } else if (variance <= 1) {
        return "Orange";
      } else {
        return "Crimson";
      }
    })
    .attr("data-year", (item) => {
      return item["year"];
    })
    .attr("data-month", (item) => {
      return item["month"] - 1; // Javascript months start from 0 and end at 11
    })
    .attr("data-temp", (item) => {
      return baseTemp + item["variance"]; // Actual temperature
    })
    .attr("height", (item) => {
      return (height - 2 * padding) / 12;
    })
    .attr("y", (item) => {
      return yScale(new Date(0, item["month"] - 1, 0, 0, 0, 0, 0));
    })
    .attr("width", (item) => {
      numberOfYear = maxYear - minYear;
      return (width - 2 * padding) / numberOfYear;
    })
    .attr("x", (item) => xScale(item["year"]))
    .on("mouseover", (e, item) => {
      tooltip.transition().style("visibility", "visible");

      let monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      tooltip.text(
        item["year"] +
          " " +
          monthNames[item["month"] - 1] +
          " : " +
          item["variance"]
      );

      tooltip.attr("data-year", item["year"]);
    })
    .on("mouseout", (item) => {
      tooltip.transition().style("visibility", "hidden");
    });
};

let drawAxes = () => {
  let xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B")); // %B mean show full month as string, while %b is shorthand for month like jan, feb

  canvas
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(0, " + (height - padding) + ")");

  canvas
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ", 0)");
};

req.open("GET", url, true); //? Takes 3 properties, method, url and async flag
req.onload = () => {
  //?  runs when theres a response to our request
  //   console.log(req.responseText); // returns a JSON string
  let object = JSON.parse(req.responseText);
  baseTemp = object["baseTemperature"];
  values = object["monthlyVariance"];
  console.log(baseTemp);
  console.log(values);
  generateScales();
  drawCells();
  drawAxes();
};
req.send();
