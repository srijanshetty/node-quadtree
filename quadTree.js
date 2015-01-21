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
        // console.log('Making center ' + point + ' of ' + root);
        root.center = point;
    } else if (root.isLeaf()) {
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
        // console.log(root.center.toString());
        return;
    }

    // Recurse forward if it's not a leaf
    return pointQuery(root.getQuadrant(point), point);
}

// Perform a range query
function rangeQuery(root, point, radius) {
    console.log(root.toString());
    if (root === null || root.isEmpty()) {
        return false;
    }

    // If we have reached an object, print it
    if (root.isLeaf()) {
        console.log(root.center.toString());
        return;
    }

    // Check all quadrants
    if (root.firstQuad && root.firstQuad.getMinDistance(point) < radius) {
        rangeQuery(root.firstQuad, point, radius);
    }

    if (root.secondQuad && root.secondQuad.getMinDistance(point) < radius) {
        rangeQuery(root.secondQuad, point, radius);
    }

    if (root.thirdQuad && root.thirdQuad.getMinDistance(point) < radius) {
        rangeQuery(root.thirdQuad, point, radius);
    }

    if (root.fourthQuad && root.fourthQuad.getMinDistance(point) < radius) {
        rangeQuery(root.fourthQuad, point, radius);
    }
}
/*---------------------------------------------*/

// Export all objects
module.exports.Point = Point;
module.exports.QuadTree = QuadTree;

var lp = new Point(0,0);
var up = new Point(1,1);

var q1 = new QuadTree(up, lp);
insert(q1, new Point(0.3,0.3));
insert(q1, new Point(0.2,0.2));
insert(q1, new Point(0.7,0.7));
insert(q1, new Point(0.1,0.1));
insert(q1, new Point(0.6,0.6));
insert(q1, new Point(0.6,0.6));
insert(q1, new Point(0.6,0.6));

rangeQuery(q1, new Point(0.5, 0.5), 1);
// consose.log(JSON.stringify(q1, null, 2));
