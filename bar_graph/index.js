const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

function formatDateToQuarter(dateString) {
  const [year, month] = dateString.split("-").map(Number);

  let quarter;
  if (month >= 1 && month <= 3) {
    quarter = "Q1";
  } else if (month >= 4 && month <= 6) {
    quarter = "Q2";
  } else if (month >= 7 && month <= 9) {
    quarter = "Q3";
  } else {
    quarter = "Q4";
  }

  return `${year} ${quarter}`;
}

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const json = data;
    const dataset = json.data;
    const title = "United States GDP";

    document.getElementById("title").textContent = title;
    const width = 1100;
    const height = 500;
    const padding = 60;

    const svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Axes

    // X axis. scale by Time
    const xScale = d3
      .scaleTime()
      .domain([
        new Date(dataset[0][0]),
        new Date(dataset[dataset.length - 1][0]),
      ])
      .range([padding, width - padding]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding})`)
      .call(xAxis)
      .style("font-size", "16px")
      .selectAll(".tick")
      .attr("class", "tick");

    // Y axis. scale Linearly
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d[1])])
      .range([height - padding, padding]);

    const yAxis = d3.axisLeft(yScale);

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis)
      .selectAll(".tick")
      .attr("class", "tick")
      .style("font-size", "16px");

    // Bars (rects)

    svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .attr("x", (d) => xScale(new Date(d[0])))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", (width - 2 * padding) / dataset.length)
      .attr("height", (d) => height - padding - yScale(d[1]))
      .attr("fill", "#fff")

      // Mouse events

      .on("mouseenter", function (e, d) {
        const tooltip = d3.select("#tooltip");
        const t1 = formatDateToQuarter(d[0]);
        const t2 = d[1];

        console.log(t1);
        tooltip
          .transition()
          .duration(0)
          .style("opacity", 0.9)
          .style("left", e.pageX + 10 + "px")
          .style("top", e.pageY + 10 + "px")
          .style("font-size", "20px");

        tooltip.attr("data-date", d[0]).html(`${t1} <br> $${t2} Billion`);
      })

      .on("mouseleave", function (e) {
        d3.select("#tooltip").style("opacity", 0);
      });

    // Tool-tip
    d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", "0")
      .style("position", "absolute")
      .style("background-color", "rgba(0, 0, 0, 0.8")
      .style("color", "#fff")
      .style("padding", "18px")
      .style("border-radius", "6px");
  });
