import React from 'react';
import ReactMapboxGl, { Popup, RotationControl, ZoomControl} from 'react-mapbox-gl';
import PieChart from 'react-minimal-pie-chart';
import './App.css';
import data from "./data/kindergartes_info_osm_proc.json";
import * as turf from '@turf/turf'

const geojson = data;
/*{
  "type": "FeatureCollections",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "129",
        "childrens": 20,
        "places": 29,
        "reserved": 5,
        "free": 4
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          30.628101825714094,
          50.45005475483897
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "131",
        "childrens": 61,
        "places": 77,
        "reserved": 7,
        "free": 9
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          30.505964756011963,
          50.398745609325054
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "150",
        "childrens": 62,
        "places": 63,
        "reserved": 1,
        "free": 0
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          30.44935941696166,
          50.38228812291681
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "196",
        "childrens": 67,
        "places": 94,
        "reserved": 23,
        "free": 4
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          30.4504644870758,
          50.38290384245888
        ]
      }
    }
  ]
};*/

// colors for sectors in donout chart
const colorFree = "#E38627";
const colorReserved = "#6A2135";
const colorOccupied = "#C13C37";

// color for active text
const colorTextActive = "#0A0A28"

// color for inactive item in legend for donout chart
const colorInactive = "#D3D3D3"

const Map = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoiZGVuaXNrb25vbmVua28iLCJhIjoiY2pnY2QwanM4MDJuYjJxdGN6cWN4d2dkcSJ9.uih5MR-tgpbVwBsooCFhgw'
});

class MapOverlay extends React.Component {
  constructor(props){
    super(props);
    this.style = {
      fontFamily: "Roboto", 
      fontSize: "12px",
      color: colorTextActive,
      backgroundColor: "#fff",
      borderRadius: "3px",
      position: "absolute",
      padding: "10px",
      top: "10px",
      left: "10px",
      height: "20px"
    }
  }
  render(){
    return(
      <div style={this.style}>
        <div>Kindergartens number in the circle area of <b>{this.props.radii}</b> km radii:  <b>{this.props.number}</b></div>
      </div>
    )
  }
}

class LegendItem extends React.Component {
  constructor(props){
    super(props);
    this.style = {
      backgroundColor: props.color,
      height: "4px",
      width: "4px",
      padding: "5px",
      display: "inline-block",
      verticalAlign: "middle",
      textAlign: "center"
    }
  }
  render(){
    return(
      <div style={{textAlign: "left", paddingLeft: "12px"}}>
        <div style={this.style}></div>
        <div style={{display: "inline-block", paddingLeft: "5px", verticalAlign: "middle", textAlign: "center", fontFamily: "Roboto", fontSize: "12px", color: this.props.textColor}}>{this.props.text}</div>
      </div>
    )
  }
}

class PopupTooltip extends React.Component {
  constructor(props){
    super(props);
    this.data = [];
  
    if (this.props.free !== 0){
      // init colors of legend symbol and colors of legend text
      this.locColorFree = colorFree;
      this.locColorTextFree = colorTextActive;
      this.data.push({
        title: 'Free',
        value:  this.props.free,
        color:  this.locColorFree
      })
    } else {
      this.locColorFree = colorInactive;
      this.locColorTextFree = colorInactive;
    }

    if (this.props.res !== 0){
      // init colors of legend symbol and colors of legend text
      this.locColorOccupied = colorOccupied;
      this.locColorTextOccupied = colorTextActive;
      this.data.push({
        title: 'Reserved',
        value:  this.props.res,
        color:  this.locColorOccupied
      })
    } else {
      this.locColorOccupied = colorInactive;
      this.locColorTextOccupied = colorInactive;
    }

    if (this.props.chld !== 0){
      // init colors of legend symbol and colors of legend text
      this.locColorReserved = colorReserved;
      this.locColorTextReserved = colorTextActive;
      this.data.push({
        title: 'Childrens',
        value:  this.props.chld,
        color:  this.locColorReserved
      })
    } else {
      this.locColorReserved = colorInactive;
      this.locColorTextReserved = colorInactive;
    }
  }
  render(){
    return(
      <Popup
      coordinates={[this.props.lat, this.props.long]}
      anchor={"bottom"}
      offset={{
        'bottom-left': [12, -12],  'bottom': [0, -12], 'bottom-right': [-12, -12]
      }}>
      <PieChart
      data={this.data}
      label
      labelStyle={{
        fontSize: '9px',
        fontFamily: 'Roboto'
      }}
      totalValue={this.props.total}
      radius={42}
      lineWidth={20}
      labelPosition={66}
      style={{height: '100px', width: '160px'}}
      lengthAngle={-180}
      ratio={2}
      />
      <LegendItem color={this.locColorFree} textColor={this.locColorTextFree} text={"Вільних місць"}/>
      <LegendItem color={this.locColorOccupied} textColor={this.locColorTextOccupied} text={"Зайнятих"}/>
      <LegendItem color={this.locColorReserved} textColor={this.locColorTextReserved} text={"Зарезервованих"}/>
      </Popup>
    )
  }
}

class InfoLayer extends React.Component {
  constructor(props){
    super(props);
    this.features = props.geojson.features;
  }

  createPopups = () => {
    let popupsList = [];
    this.features.forEach(element => {
      popupsList.push(<PopupTooltip lat={element.geometry.coordinates[0]} long={element.geometry.coordinates[1]} free={element.properties.free} res={element.properties.reserved} chld={element.properties.childrens} total={element.properties.palces}/>);
    });
    return popupsList;
  }

  render(){
    console.log(this.createPopups());
    return(
      <div>
        {this.createPopups()}
      </div>
    )
  }
}

class MapComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
                  showMap: false,
                  zoom: [15],
                  center: [30.4506825, 50.382702],
                  renderedData: {
                    "type": "FeatureCollections",
                    "features": [
                      {
                        "type": "Feature",
                        "properties": {
                          "name": "129",
                          "childrens": 20,
                          "places": 29,
                          "reserved": 5,
                          "free": 4
                        },
                        "geometry": {
                          "type": "Point",
                          "coordinates": [
                            30.628101825714094,
                            50.45005475483897
                          ]
                        }
                      }]}
                };
  }

  getCurrentData(center){
    let actualFeaturesList = {"type": "FeatureCollection", "features": []};
    let threshold = 2; // radii of feature rendering in kilometers

    this.props.initData.features.forEach(element => {
      let featureCoordinates = [element.geometry.coordinates[1], element.geometry.coordinates[0]];
      let featurePoint = turf.point(featureCoordinates);
      let distanceToCenter = turf.distance(center, featurePoint);
      console.log("first point: " + featurePoint.geometry.coordinates + ",   second point: " + center.geometry.coordinates);
      console.log("Distnace to center   " + distanceToCenter);
      // compare distance between center of map bounds and the feature point to the threshold distance, 
      // if it is less than threshold include corresponding feature to the rendered list
      if (distanceToCenter <= threshold){
        actualFeaturesList.features.push(element);
        console.log('elements ' + element);
      }
    })
    console.log("Features in the view area:  " + actualFeaturesList.features.length);
    return actualFeaturesList;
  }

  resetRenderedData(center){
    this.setState({showMap: this.state.showMap, zoom: this.state.zoom, center: this.state.center, renderedData: this.getCurrentData(center)});
  }

  toogleShowMap(){
    this.setState({showMap: !this.state.showMap, zoom: this.state.zoom, center: this.state.center, renderedData: this.state.renderedData});
  }

  onZoom = () => {
    if (this.map.getZoom() >= 18 && !this.state.showMap){
      console.log('\nzoom: ' + this.map.getZoom() + "  show info");
      this.toogleShowMap();
    }
    else if (this.map.getZoom() <= 18 && this.state.showMap){
      console.log('\nzoom: ' + this.map.getZoom() + "  hide info");
      this.toogleShowMap();
    }           
  }

  onMove = () => {
    let bounds = this.map.getBounds();
    let center = bounds.getCenter();
    let pointCenter = turf.point([center.lat, center.lng]);
    
    this.resetRenderedData(pointCenter);
  }

  render(){
    return(
      <Map
      style={"https://api.maptiler.com/maps/3facac85-4f4f-4917-9926-bef23b53a487/style.json?key=brAq6ZyIGL19175g0ZdK"}
      center={this.state.center}
      zoom={this.state.zoom}
      containerStyle={{
        height: '100vh',
        width: '100vw'
      }}
      onStyleLoad={ el => this.map = el }
      onZoom={this.onZoom}
      onMoveEnd={this.onMove}>
      <RotationControl position="bottom-right"/>
      <ZoomControl position="bottom-right"/>
      {this.state.showMap && <InfoLayer geojson={this.state.renderedData}/>}
      <MapOverlay radii={2} number={this.state.renderedData.features.length}/>
      </Map>
    );
  }
}

function App() {
  return (
    <div className="App">
      <MapComponent initData={geojson}/>
    </div>
  );
}

export default App;
