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

function Point(_X, _Y) {
    this.X = _X;
    this.Y = _Y;
}

Point.prototype.toString = function (){
    return '(' + this.X + ',' + this.Y + ')';
};

function getMedian(p1, p2) {
    var midX = (p1.X + p2.X)/2;
    var midY = (p1.Y + p2.Y)/2;
    return new Point(midX, midY);
}

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
        return Math.sqrt(xcontrib*xcontrib + ycontrib*ycontrib);
    },

    split: function() {
        // Compute all the required points
        var centerPoint = getMedian(this.upperPoint, this.lowerPoint);
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

function insert(root, point) {
    if (root.isEmpty()) {
        // If the current node is empty, make root the point
        console.log('Making center ' + point + ' of ' + root);
        root.center = point;
    } else if (root.isLeaf()) {
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
        console.log('Moving forward from ' + root);
        insert(root.getQuadrant(point), point);
    }
}

// Export all objects
module.exports.Point = Point;
module.exports.QuadTree = QuadTree;

var lp = new Point(0,0);
var up = new Point(1,1);

var q1 = new QuadTree(up, lp);
insert(q1, new Point(0.3,0.3));
insert(q1, new Point(0.2,0.2));
insert(q1, new Point(0.7,0.7));

// consose.log(JSON.stringify(q1, null, 2));
