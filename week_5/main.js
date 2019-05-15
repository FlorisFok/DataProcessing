// Some variables
var teensInViolentArea = "https://stats.oecd.org/SDMX-JSON/data/CWB/AUS+AUT+BEL+BEL-VLG+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+OAVG+NMEC+BRA+BGR+CHN+COL+CRI+HRV+CYP+IND+IDN+MLT+PER+ROU+RUS+ZAF.CWB11/all?startTime=2010&endTime=2017"
var teenPregnancies = "https://stats.oecd.org/SDMX-JSON/data/CWB/AUS+AUT+BEL+BEL-VLG+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+OAVG+NMEC+BRA+BGR+CHN+COL+CRI+HRV+CYP+IND+IDN+MLT+PER+ROU+RUS+ZAF.CWB46/all?startTime=1960&endTime=2017"
var GDP = "https://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+EU28+EU15+OECDE+OECD+OTF+NMEC+ARG+BRA+BGR+CHN+COL+CRI+HRV+CYP+IND+IDN+MLT+ROU+RUS+SAU+ZAF+FRME+DEW.B1_GE.HCPC/all?startTime=2012&endTime=2018&dimensionAtObservation=allDimensions"
var requests = [d3.json(GDP), d3.json(teenPregnancies), d3.json(teensInViolentArea)]//, d3.json(teenPregnancies)];

// Ececute after the HTML loaded
document.addEventListener('DOMContentLoaded', (event) => {
Promise.all(requests).then(function(response) {

    // Parse the data from the api into more usable json
    var data_gdp = transformResponsegdp(response[0]);
    var data_teen = transformResponseteen(response[1]);
    var data_area = transformResponseteen(response[2])

    // Make giant list of all countries
    var c_list = Object.keys(data_teen).concat(
                 Object.keys(data_area)).concat(
                 Object.keys(data_gdp));

    // Declare some variables
    const variables = 3;
    const YEARS = [2012, 2013, 2014, 2015, 2016];
    var AUTO = 2012;

    // Find the countries with all the data
    var countries = return_common(c_list, variables);

    // Make the select dropdown
    make_options(YEARS)

    // Make the data array for d3
    var data_array = {}
    for (let i =0; i < YEARS.length; i++){
      data_array[YEARS[i]] = []
    }

    // Random vars
    var countries_used = []
    var fails = 0;

    // Get all the years and countries needed for the plot and place them in
    // a list
    for (let i = 0; i < countries.length; i++){
      var country = countries[i];
      var count = 0;
      // For every country get the data corresponding to the dataset
      for (let j = 0; j < data_gdp[country].length; j++){
        let inner_data = data_gdp[country][j]
        // Select the selected lists
        if (YEARS.includes( parseInt(inner_data['Year']))) {
          // Add the dict of the country to the data list
          data_array[parseInt(inner_data['Year'])]
            .push({'gdp': inner_data['Datapoint']});
          count++;
        }
      }
      // Do this twice more, with the rest
      for (let j = 0; j < data_teen[country].length; j++){
        let inner_data = data_teen[country][j]
        if (YEARS.includes( parseInt(inner_data['Time']))) {
          data_array[parseInt(inner_data['Time'])][i - fails]['teen'] = inner_data['Datapoint'];
          count++;
        }
      }
      for (let j = 0; j < data_area[country].length; j++){
        let inner_data = data_area[country][j]
        if (YEARS.includes( parseInt(inner_data['Time']))) {
          data_array[parseInt(inner_data['Time'])][i - fails]['area'] = inner_data['Datapoint'];
          count++;
        }
      }

      // If not all the data was present, remove it
      if (!(count == (YEARS.length* variables ))){
        var keys = Object.keys(data_array);
        for (let i = 0; i < keys.length; i++){
          data_array[keys[i]].pop();
        }
        // adjust for the popping
        fails++;
      }
      else{
        // Add the country label
        var keys = Object.keys(data_array);
        for (let j = 0; j < keys.length; j++){
          data_array[parseInt(keys[j])][i - fails]['country'] = country;
        }
        countries_used.push(country);
      }
    }
    // Make the plot
    make_plot(data_array, countries_used, AUTO);

  }).catch(function(e){
      throw(e);
  });
});
