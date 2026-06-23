const fs = require('fs');
const data = JSON.parse(fs.readFileSync('ethiopia.json', 'utf8'));

function signedArea(ring) {
  let sum = 0;
  for(let i=0; i<ring.length-1; i++) {
    sum += ring[i][0] * ring[i+1][1] - ring[i+1][0] * ring[i][1];
  }
  return sum / 2;
}

let modified = false;
data.features.forEach((f, index) => {
  if (!f.properties || !f.properties.name) {
    f.properties = { id: 'region-' + index, name: 'Region ' + (index + 1) };
    modified = true;
  }
  
  if (f.geometry.type === 'Polygon') {
    f.geometry.coordinates.forEach((ring, rIdx) => {
      let first = ring[0];
      let last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        ring.push([...first]);
        modified = true;
      }
      let area = signedArea(ring);
      // For exterior ring (rIdx === 0), GeoJSON requires CCW (area > 0)
      if (rIdx === 0 && area < 0) {
        console.log('Reversing exterior ring for region ' + index);
        ring.reverse();
        modified = true;
      }
      // Inner rings (holes) should be CW (area < 0)
      if (rIdx > 0 && area > 0) {
        console.log('Reversing hole inner ring for region ' + index);
        ring.reverse();
        modified = true;
      }
    });
  }
});

fs.writeFileSync('ethiopia.json', JSON.stringify(data, null, 2));
console.log('Fixed winding order and saved to ethiopia.json. Modified: ' + modified);
