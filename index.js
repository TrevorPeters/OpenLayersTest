import 'ol/ol.css';
import Control from 'ol/control/Control';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import {fromLonLat} from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Vector from 'ol/source/Vector';
import Feature from 'ol/Feature';
import {circular} from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import {Style, Icon, Text} from 'ol/style';
import OSM from 'ol/source/OSM';
import sync from 'ol-hashed';

const iconFeature = new Feature({
  geometry: new Point(fromLonLat([-122.42861, 47.15633])),
  name: 'Church For All Nations'
});

const iconText = new Text({
  text: 'Church For All Nations',
  offsetY: 10,
  scale: 1.3
})

const iconImage =  new Icon({
  anchor: [0.5, 46],
  anchorXUnits: 'fraction',
  anchorYUnits: 'pixels',
  src: 'https://openlayers.org/en/latest/examples/data/icon.png'
})

var iconStyle = new Style({
  image: iconImage,
  text: iconText
})

const marker = new VectorLayer({
  source: new Vector({
    features: [iconFeature]
  }),
  style: iconStyle
})

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    marker
  ],
  view: new View({
    center: [0, 0],
    zoom: 0
  }),
});

const source = new VectorSource();
const layer = new VectorLayer({
  source: source
});
map.addLayer(layer);

navigator.geolocation.watchPosition(function(pos) {
  const coords = [pos.coords.longitude, pos.coords.latitude];
  const accuracy = circular(coords, pos.coords.accuracy);
  source.clear(true);
  source.addFeatures([
    new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
    new Feature(new Point(fromLonLat(coords)))
  ]);
  }, function(error) {
    alert(`ERROR: ${error.message}`);
  }, {
    enableHighAccuracy: true
});

const locate = document.createElement('div');
locate.className = 'ol-control ol-unselectable locate';
locate.innerHTML = '<button title="Locate me">◎</button>';
locate.addEventListener('click', function() {
  if (!source.isEmpty()) {
    map.getView().fit(source.getExtent(), {
      maxZoom: 18,
      duration: 500
    });
  }
});
map.addControl(new Control({
  element: locate
}));

sync(map);