let movieDataUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

let movieData;

let canvas = d3.select("#canvas");
let tooltip = d3.select("#tooltip");

let drawTreeMap = () => {
  let hierarchy = d3
    .hierarchy(movieData, (node) => {
      return node["children"];
    })
    .sum((node) => {
      return node["value"];
    })
    .sort((node1, node2) => {
      return node2["value"] - node1["value"]; // if this returns a +ve number. Node_2 is placed before Node_1. if -ve then Node_1 is placed before Node_2
    });

  let createTreeMap = d3.treemap().size([1000, 600]); // adds (x0, y0) and (y1, y2) coordinates to each leaf node for drawing the treemap
  createTreeMap(hierarchy);

  let movieTiles = hierarchy.leaves();
  console.log(movieTiles);

  // g = group element, cant set x and y for 'g' tags so use transform
  let block = canvas
    .selectAll("g")
    .data(movieTiles)
    .enter()
    .append("g")
    .attr("transform", (movie) => {
      return "translate(" + movie["x0"] + ", " + movie["y0"] + ")";
    });

  block
    .append("rect")
    .attr("class", "tile")
    .attr("fill", (movie) => {
      let category = movie["data"]["category"];
      if (category === "Action") {
        return "orange";
      } else if (category === "Drama") {
        return "lightgreen";
      } else if (category === "Adventure") {
        return "coral";
      } else if (category === "Family") {
        return "lightblue";
      } else if (category === "Animation") {
        return "pink";
      } else if (category === "Comedy") {
        return "khaki";
      } else if (category === "Biography") {
        return "tan";
      }
    })
    .attr("data-name", (movie) => {
      return movie["data"]["name"];
    })
    .attr("data-category", (movie) => {
      return movie["data"]["category"];
    })
    .attr("data-value", (movie) => {
      return movie["data"]["value"];
    })
    .attr("width", (movie) => {
      return movie["x1"] - movie["x0"];
    })
    .attr("height", (movie) => {
      return movie["y1"] - movie["y0"];
    })
    .on("mouseover", (e, movie) => {
      tooltip.transition().style("visibility", "visible");

      let revenue = movie["data"]["value"]
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      tooltip.html("$ " + revenue + "<hr />" + movie["data"]["name"]);

      tooltip.attr("data-value", movie["data"]["value"]);
    })
    .on("mouseout", (e, movie) => {
      tooltip.transition().style("visibility", "hidden");
    });

  // Since we can't add text to rect element. we select g tag and add svg text element to it
  block
    .append("text")
    .text((movie) => {
      return movie["data"]["name"];
    })
    .attr("x", 5)
    .attr("y", 20);
};

d3.json(movieDataUrl).then((data, error) => {
  if (error) {
    console.log(error);
  } else {
    movieData = data;
    drawTreeMap();
  }
});
