let url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
let req = new XMLHttpRequest();

let values = [];

// Scales
let xScale;
let yScale;

let width = 800;
let height = 600;
let padding = 40;

let svg = d3.select("svg");
let tooltip = d3.select("#tooltip");

function convertToPST(date) {
  // Needed function to pass User Story 6
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  const offset = -8;
  const pstTime = new Date(utcTime + offset * 3600000);
  return pstTime;
}

let drawCanvas = () => {
  svg.attr("width", width).attr("height", height);
};

let generateScales = () => {
  xScale = d3
    .scaleLinear()
    // Remove 1 year and add 1 to min and max values of the domain, just to make the plot prettier
    .domain([
      d3.min(values, (i) => {
        return i["Year"];
      }) - 1,
      d3.max(values, (i) => {
        return i["Year"];
      }) + 1,
    ])
    .range([padding, width - padding]);

  yScale = d3
    .scaleTime()
    .domain([
      d3.min(values, (i) => {
        return convertToPST(new Date(i["Seconds"] * 1000));
      }),
      d3.max(values, (i) => {
        return convertToPST(new Date(i["Seconds"] * 1000));
      }),
    ])
    .range([padding, height - padding]); // Shorter time taken is better (in race) hence its put at the top of the y-axis
};

let drawPoints = () => {
  // Bind circle elements with each value element
  svg
    .selectAll("circle")
    .data(values)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 10)
    .attr("data-xvalue", (item) => {
      return item["Year"];
    })
    .attr("data-yvalue", (item) => {
      let date = new Date(item["Seconds"] * 1000);
      let converted_date = convertToPST(date);
      return converted_date; // Passing milliseconds to the Date object
    })
    .attr("cx", (item) => {
      return xScale(item["Year"]);
    })
    .attr("cy", (item) => {
      return yScale(convertToPST(new Date(item["Seconds"] * 1000)));
    })
    .attr("fill", (item) => {
      if (item["Doping"] != "") {
        return "orange";
      } else {
        return "limegreen";
      }
    })
    .on("mouseover", (e, item) => {
      tooltip.transition().style("visibility", "visible");

      if (item["Doping"] == "") {
        tooltip.html(
          "<br>" +
            item["Name"] +
            ": " +
            item["Nationality"] +
            "<br/>" +
            "Year: " +
            item["Year"] +
            ", " +
            "Time: " +
            item["Time"]
        );
      } else {
        tooltip.html(
          "<br>" +
            item["Name"] +
            ": " +
            item["Nationality"] +
            "<br/>" +
            "Year: " +
            item["Year"] +
            ", " +
            "Time: " +
            item["Time"] +
            "<br /><br />" +
            item["Doping"]
        );
      }

      tooltip.attr("data-year", item["Year"]);
    })
    .on("mouseout", (e, item) => {
      tooltip.transition().style("visibility", "hidden");
    });
};

let generateAxis = () => {
  // returns set of svgs
  let xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")); // d = rounds off decimals or integers (to get rid of comma in years)

  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(0, " + (height - padding) + ")"); // y increases going down in svg

  let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S")); // %M = minutes, %S = seconds

  svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ", 0)");
};

req.open("GET", url, true);
req.onload = () => {
  console.log(req.responseText);
  values = JSON.parse(req.responseText);
  //   console.log(values);
  drawCanvas();
  generateScales();
  drawPoints();
  generateAxis();
};
req.send();
