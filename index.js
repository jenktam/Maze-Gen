document.getElementById('out').innerHTML= display(maze(8,11));

function maze(x,y) {
	var n=x*y-1;
	if (n<0) {alert("illegal maze dimensions");return;}
  var horiz =[];
  for (var j= 0; j<x+1; j++) horiz[j]= [],
	    verti =[]; for (var j= 0; j<x+1; j++) verti[j]= [],
	    here = [Math.floor(Math.random()*x), Math.floor(Math.random()*y)],
	    path = [here],
	    unvisited = [];
	for (var j = 0; j<x+2; j++) {
		unvisited[j] = [];
		for (var k= 0; k<y+1; k++)
			unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
	}

  function step() {
		if (0<n) {
		var potential = [[here[0]+1, here[1]], [here[0],here[1]+1],
		    [here[0]-1, here[1]], [here[0],here[1]-1]];
		var neighbors = [];
		for (var j = 0; j < 4; j++)
			if (unvisited[potential[j][0]+1][potential[j][1]+1])
				neighbors.push(potential[j]);
		if (neighbors.length) {
			n = n-1;
			next= neighbors[Math.floor(Math.random()*neighbors.length)];
			unvisited[next[0]+1][next[1]+1]= false;
			if (next[0] == here[0])
				horiz[next[0]][(next[1]+here[1]-1)/2]= true;
			else
				verti[(next[0]+here[0]-1)/2][next[1]]= true;
			here= next;
			if (1 < neighbors.length)
				path.push(here);
		} else
      here = path.pop();
   			document.getElementById('out').innerHTML= display({x: x, y: y, horiz: horiz, verti: verti, here: here});
			setTimeout(step, 100);
		}
	}
	step();
	return {x: x, y: y, horiz: horiz, verti: verti};
  }

function display(m) {
	var text= [];
	for (var j= 0; j<m.x*2+1; j++) {
		var line= [];
		if (0 == j%2)
			for (var k=0; k<m.y*4+1; k++)
        // if (0 == k%4)
        if (m.here && m.here[0]*2+1 == j && m.here[1]*4+2 == k)
					line[k]= '#'
				else if (0 == k%4) {
          line[k]= '+';
        }
				else
					if (j>0 && m.verti[j/2-1][Math.floor(k/4)])
						line[k]= ' ';
					else
						line[k]= '-';
		else
			for (var k=0; k<m.y*4+1; k++)
				if (0 == k%4)
					if (k>0 && m.horiz[(j-1)/2][k/4-1])
						line[k]= ' ';
					else
						line[k]= '|';
				else
					line[k]= ' ';
		if (0 == j) line[1]= line[2]= line[3]= ' ';
		if (m.x*2-1 == j) line[4*m.y]= ' ';
		text.push(line.join('')+'\r\n');
	}
	return text.join('');
}

Node.prototype.add = function(tag, cnt, txt) {
	for (var i = 0; i < cnt; i++)
		this.appendChild(ce(tag, txt));
}
Node.prototype.ins = function(tag) {
	this.insertBefore(ce(tag), this.firstChild)
}
Node.prototype.kid = function(i) { return this.childNodes[i] }
Node.prototype.cls = function(t) { this.className += ' ' + t }

NodeList.prototype.map = function(g) {
	for (var i = 0; i < this.length; i++) g(this[i]);
}

function ce(tag, txt) {
	var x = document.createElement(tag);
	if (txt !== undefined) x.innerHTML = txt;
	return x
}

function gid(e) { return document.getElementById(e) }
function irand(x) { return Math.floor(Math.random() * x) }

function make_maze() {
	var w = parseInt(gid('rows').value || 8, 10);
	var h = parseInt(gid('cols').value || 8, 10);
	var tbl = gid('maze');
	tbl.innerHTML = '';
	tbl.add('tr', h);
	tbl.childNodes.map(function(x) {
			x.add('th', 1);
			x.add('td', w, '*');
			x.add('th', 1)});
	tbl.ins('tr');
	tbl.add('tr', 1);
	tbl.firstChild.add('th', w + 2);
	tbl.lastChild.add('th', w + 2);
	for (var i = 1; i <= h; i++) {
		for (var j = 1; j <= w; j++) {
			tbl.kid(i).kid(j).neighbors = [
				tbl.kid(i + 1).kid(j),
				tbl.kid(i).kid(j + 1),
				tbl.kid(i).kid(j - 1),
				tbl.kid(i - 1).kid(j)
			];
		}
	}
	walk(tbl.kid(irand(h) + 1).kid(irand(w) + 1));
	gid('solve').style.display='inline';
}

function shuffle(x) {
	for (var i = 3; i > 0; i--) {
		j = irand(i + 1);
		if (j == i) continue;
		var t = x[j]; x[j] = x[i]; x[i] = t;
	}
	return x;
}

var dirs = ['s', 'e', 'w', 'n'];
function walk(c) {
	c.innerHTML = '&nbsp;';
	var idx = shuffle([0, 1, 2, 3]);
	for (var j = 0; j < 4; j++) {
		var i = idx[j];
		var x = c.neighbors[i];
		if (x.textContent != '*') continue;
		c.cls(dirs[i]), x.cls(dirs[3 - i]);
		walk(x);
	}
}

function solve(c, t) {
	if (c === undefined) {
		c = gid('maze').kid(1).kid(1);
		c.cls('v');
	}
	if (t === undefined)
		t = gid('maze')	.lastChild.previousSibling
				.lastChild.previousSibling;

	if (c === t) return 1;
	c.vis = 1;
	for (var i = 0; i < 4; i++) {
		var x = c.neighbors[i];
		if (x.tagName.toLowerCase() == 'th') continue;
		if (x.vis || !c.className.match(dirs[i]) || !solve(x, t))
			continue;

		x.cls('v');
		return 1;
	}
	c.vis = null;
	return 0;
}
