/*
 * Copyright (c) 2015 Srijan R Shetty <srijan.shetty+code@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var PriorityQueue = require('priorityqueuejs');

/* ---------------- POINT -------------------- */
function Point(_X, _Y) {
    this.X = _X;
    this.Y = _Y;
}

Point.prototype = {
    getMedian: function getMedian(p1, p2) {
        var midX = (p1.X + p2.X)/2;
        var midY = (p1.Y + p2.Y)/2;

        return new Point(midX, midY);
    },

    getDistance: function getDistance(p1) {
        var X = this.X - p1.X;
        var Y = this.Y - p1.Y;

        return Math.sqrt(X * X + Y * Y);
    },

    isSame: function isSame(p1) {
        return (this.X === p1.X && this.Y === p1.Y);
    },

    toString: function toString() {
        return '(' + this.X + ', ' + this.Y + ')';
    }
};

/*---------------------------------------------*/

/* ---------------- PAIR -------------------- */
function Pair(_first, _second) {
    this.first = _first;
    this.second = _second;
}

Pair.prototype = {
    toString: function toString() {
        return '(' + this.first + ', ' + this.second + ')';
    }
};
/*---------------------------------------------*/

/* ---------------- QuadTree ----------------- */
function QuadTree(_upperPoint, _lowerPoint, _center) {
    this.upperPoint = _upperPoint;
    this.lowerPoint = _lowerPoint;
    this.center = _center || null;
    this.firstQuad = null;
    this.secondQuad = null;
    this.thirdQuad = null;
    this.fourthQuad = null;
    this.leaf = true;
}

QuadTree.prototype = {
    // Check if the current node is a leaf node
    isLeaf: function isLeaf() {
        return this.leaf;
    },

    // Check if the current node is empty
    isEmpty: function isEmpty() {
        return (this.center === null);
    },

    // Check which quadrant a given point should go to
    getQuadrant: function getQuadrant(point) {
        // Now check the four quadrants
        if (this.firstQuad && this.firstQuad.getMinDistance(point) === 0) {
            return this.firstQuad;
        } else if (this.secondQuad && this.secondQuad.getMinDistance(point) === 0) {
            return this.secondQuad;
        } else if (this.thirdQuad && this.thirdQuad.getMinDistance(point) === 0) {
            return this.thirdQuad;
        } else {
            return this.fourthQuad;
        }

        console.log('ERROR');
    },

    // Get the min distance of a point from the current quadrant
    getMinDistance: function getMinDistance(point) {
        // Compute the xcontribution
        var xcontrib = 0;
        if (point.X > this.upperPoint.X) {
            xcontrib = point.X - this.upperPoint.X;
        } else if (point.X < this.lowerPoint.X) {
            xcontrib = this.lowerPoint.X - point.X;
        } else {
            xcontrib = 0;
        }

        // Compute the ycontribution
        var ycontrib = 0;
        if (point.Y > this.upperPoint.Y) {
            ycontrib = point.Y - this.upperPoint.Y;
        } else if (point.Y < this.lowerPoint.Y) {
            ycontrib = this.lowerPoint.Y - point.Y;
        } else {
            ycontrib = 0;
        }

        // Return the distance
        return Math.sqrt(xcontrib * xcontrib + ycontrib * ycontrib);
    },

    split: function() {
        // console.log('Splitting ' + this);
        // Compute all the required points
        var centerPoint = Point.prototype.getMedian(this.upperPoint, this.lowerPoint);
        var secondUpper = new Point(centerPoint.X, this.upperPoint.Y);
        var secondLower = new Point(this.lowerPoint.X, centerPoint.Y);
        var fourthUpper = new Point(this.upperPoint.X, centerPoint.Y);
        var fourthLower = new Point(centerPoint.X, this.lowerPoint.Y);

        // Create the quadrants
        this.firstQuad = new QuadTree(this.upperPoint, centerPoint);
        this.secondQuad = new QuadTree(secondUpper, secondLower);
        this.thirdQuad = new QuadTree(centerPoint, this.lowerPoint);
        this.fourthQuad = new QuadTree(fourthUpper, fourthLower);

        // Set the center point
        this.center = centerPoint;

        // This is no more a leaf node
        this.leaf = false;
    },

    toString: function () {
        return '[L: ' + this.lowerPoint + ', C: ' + this.center + ', U:' + this.upperPoint + ']';
    }
};

// Insert element to the tree
function insert(root, point) {
    if (root.isEmpty()) {
        // If the current node is empty, make root the point
        root.center = point;
        // console.log('Making center ' + point + ' of ' + root);
    } else if (root.isLeaf()) {
        // console.log('Splitting ' + root);

        // Ignore same points
        if (root.center.isSame(point)) {
            return;
        }

        // Make a copy of the current point
        var currentRootPoint = root.center;

        // If the node is a leaf node, we split
        root.split();

        // Insert the currentRootPoint
        insert(root.getQuadrant(currentRootPoint), currentRootPoint);

        // Insert the point that caused the split
        insert(root.getQuadrant(point), point);
    } else {
        // If it is an internal node, then we delegate
        insert(root.getQuadrant(point), point);
    }
}

// Perform a point query
function pointQuery(root, point) {
    if (root === null || root.isEmpty()) {
        return false;
    }

    // Otherwise we recurse
    if (root.isLeaf() && root.center.isSame(point)) {
        console.log(root.center.toString());
        return;
    }

    // Recurse forward if it's not a leaf
    return pointQuery(root.getQuadrant(point), point);
}

// Perform a range query
function rangeQuery(root, point, radius) {
    if (root === null || root.isEmpty()) {
        return false;
    }

    // If we have reached an object, print it
    if (root.isLeaf() && root.center.getDistance(point) <= radius) {
        console.log(root.center.toString());
        return;
    }

    // Check all quadrants
    if (root.firstQuad && root.firstQuad.getMinDistance(point) <= radius) {
        rangeQuery(root.firstQuad, point, radius);
    }

    if (root.secondQuad && root.secondQuad.getMinDistance(point) <= radius) {
        rangeQuery(root.secondQuad, point, radius);
    }

    if (root.thirdQuad && root.thirdQuad.getMinDistance(point) <= radius) {
        rangeQuery(root.thirdQuad, point, radius);
    }

    if (root.fourthQuad && root.fourthQuad.getMinDistance(point) <= radius) {
        rangeQuery(root.fourthQuad, point, radius);
    }
}

// Function to implement kNN search
function kNNquery(root, point, number) {
    // Create a priority queue with the root node
    var queue = new PriorityQueue(function (p1, p2) {
        return p1.second < p2.second;
    });
    queue.enq(new Pair(root, 0));

    // create a list to maintain answers
    var answers = [];

    var top, node, minDistance;
    while (!queue.isEmpty() && answers.length < number) {
        top = queue.deq();
        node = top.first;
        minDistance = top.second;

        if (node.isEmpty()) {
            continue;
        }

        // If it is a leaf node and the distance of the node to the point
        // is less than current distance then enqueue
        if (node.isLeaf()) {
            answers.push(node);
            console.log(node.center.toString());
        } else {
            // Enqueue all internal nodes
            queue.enq(new Pair(node.firstQuad, node.firstQuad.getMinDistance(point)));
            queue.enq(new Pair(node.secondQuad, node.secondQuad.getMinDistance(point)));
            queue.enq(new Pair(node.thirdQuad, node.thirdQuad.getMinDistance(point)));
            queue.enq(new Pair(node.fourthQuad, node.fourthQuad.getMinDistance(point)));
        }
    }
}

// Export API
module.exports.QuadTree = QuadTree;
module.exports.insert = insert;
module.exports.kNNquery = kNNquery;
module.exports.rangeQuery = rangeQuery;
module.exports.pointQuery = pointQuery;

var fs = require('fs');

var root = new QuadTree(new Point(1, 1), new Point(0,0));
fs.readFileSync('./temp.txt').toString().split('\n')
    .forEach(function processLine(line) {
        var point = line.split('\t');

        if (point[0] && point[1]) {
            insert(root, new Point(parseFloat(point[0]), parseFloat(point[1])));
        }
    });

// rangeQuery(root, new Point(0.5, 0.5), 2);
kNNquery(root, new Point(0.5, 0.5), 2);
