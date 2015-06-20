
// Generate the unitary vectors:
var vec = []
for(var i=0; i < 20; i++) {
	var angle = i/20 * 2*Math.PI
	vec[i] = {'x': Math.cos(angle), 'y': Math.sin(angle)}
}
coord.prototype.vec = vec;

function coord(aminoVec) {
	pos = {'x': 0, 'y': 0}

	if(!aminoVec instanceof Array) return null;
	if(aminoVec.length != 20) return null;

	for(var i=0; i < 20; i++) {
		pos.x += aminoVec[i] * vec[i].x
		pos.y += aminoVec[i] * vec[i].y
	}

	return pos;
}

// Test:
//console.log(coord([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]))

