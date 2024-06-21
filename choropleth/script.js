let countyUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

let educationUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

let countyData;
let educationData;

let canvas = d3.select("#canvas");
let tooltip = d3.select("#tooltip");

let drawMap = () => {
  canvas
    .selectAll("path")
    .data(countyData)
    .enter()
    .append("path")
    .attr("d", d3.geoPath()) //? d attribute (used to draw svg path) is necessary for svg path and d3.geoPath() extracts the geometry required (mentioned in the dataset) for each path from the dataset and assigns it to individual path's 'd' attribute
    .attr("class", "county")
    //? Map id from geoJSON and fips code of education data of each county
    .attr("fill", (countyDataItem) => {
      let id = countyDataItem["id"];
      let county = educationData.find((item) => {
        return item["fips"] == id;
      });
      let percentage = county["bachelorsOrHigher"];
      if (percentage <= 15) {
        return "lavender";
      } else if (percentage <= 30) {
        return "thistle";
      } else if (percentage <= 45) {
        return "mediumorchid";
      } else {
        return "indigo";
      }
    })
    .attr("data-fips", (countyDataItem) => {
      return countyDataItem["id"];
    })
    .attr("data-education", (countyDataItem) => {
      let id = countyDataItem["id"];
      let county = educationData.find((item) => {
        return item["fips"] == id;
      });
      return county["bachelorsOrHigher"];
    })
    .on("mouseover", (e, countyDataItem) => {
      tooltip.transition().style("visibility", "visible");

      let id = countyDataItem["id"];
      let county = educationData.find((item) => {
        return item["fips"] == id;
      });

      tooltip.text(
        county["fips"] +
          " - " +
          county["area_name"] +
          ", " +
          county["state"] +
          " : " +
          county["bachelorsOrHigher"] +
          "%"
      );

      tooltip.attr("data-education", county["bachelorsOrHigher"]);
    })
    .on("mouseout", (e, countyDataItem) => {
      tooltip.transition().style("visibility", "hidden");
    });
};

//? Not using XMLHttp method this time, but d3's own json fetching method which takes in an url and returns a promise. on resolving the data is automatically converted to a javascript object or array of objects (whatever is appropriate) else on rejection an error is thrown

d3.json(countyUrl).then((data, error) => {
  if (error) {
    console.log(error);
  } else {
    //? D3 supports a format called GeoJSON so we will have to convert the countyData which is at start in TOPOJson format into GeoJSON which is much simpler
    countyData = topojson.feature(data, data.objects.counties).features; // This method is used to do so, takes 2 params i,e the dataset to be converted and the properties to be extracted

    //? At this point both countyData and educationData will have equal number of arrays
    console.log(countyData);

    //? Since this is an async function, we will only fetch the education data after the county data has been received to maintain order. so that means here in the else case

    d3.json(educationUrl).then((data, error) => {
      if (error) {
        console.log(error);
      } else {
        educationData = data;
        console.log(educationData);
        drawMap();
      }
    });
  }
});
