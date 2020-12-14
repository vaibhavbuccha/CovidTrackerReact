import './App.css';
import InfoBox from './InfoBox';
import Table from './Table';
import Map from './Map';
import LineGraph from './LineGraph';
import {
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select
} from '@material-ui/core';
import { useEffect, useState } from 'react';
import { sortData } from './util';
import "leaflet/dist/leaflet.css";

function App() {
  // Use state hook for set inital value
  // STATE = How to write variable in react.
  const [countries, setCountries] = useState(['USA','India','Dubai']);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 20.5937  , lng: 78.9629});
  const [mapZoom, setMapZoom] = useState(3);
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  }, []);
  // useEffect is a hook Runs a piece of code based on given condition
  useEffect(()=>{
    // the code inside here will run once 
    // when the component loads and not again 

    // async -> send a request, wait for it , do something with info
    const getCountriesData = async() => {
      await fetch ("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) =>({
            name: country.country,
            value: country.countryInfo.iso2,
        }));
        const sortedData = sortData(data);
        setTableData(sortedData);
        setCountries(countries);
      });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    // console.log(countryCode); 
    const url = countryCode === 'worldwide' 
    ? 'https://disease.sh/v3/covid-19/all' 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    });
    // https://disease.sh/v3/covid-19/all
    // https://disease.sh/v3/covid-19/countries/{country}
  }

  return (
    <div className="app">
      <div className="app__left" >
        <div className="app__header" >
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide" >Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value} >{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      
        <div className="app_stats" >
            <InfoBox 
              title="Coronavirus Cases" 
              cases={countryInfo.todayCases} 
              total={countryInfo.cases} 
            />
            <InfoBox 
              title="Recoverd" 
              cases={countryInfo.todayRecovered} 
              total={countryInfo.recovered} 
            />
            <InfoBox 
              title="Deaths" 
              cases={countryInfo.todayDeaths} 
              total={countryInfo.deaths} 
            />
        </div>

        {/** map */}
        <Map 
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right" >
        <CardContent>
          <h3>Live Cases By Country</h3>
          {/** table */}
          <Table countries={tableData} />
          <h3>Worldwide new cases</h3>
          {/** Graph */}
          <LineGraph />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
