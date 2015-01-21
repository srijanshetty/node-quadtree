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

var exports = module.exports = {};

function Point(_X, _Y) {
    this.X = _X;
    this.Y = _Y;
}

Point.prototype = {
    getMedian: function getMedian(p1, p2) {
        var midX = (p1.X + p2.X)/2;
        var midY = (p1.Y + p2.Y)/2;
        return new Point(midX, midY);
    }
};

function QuadTree(_upperPoint, _lowerPoint, _center) {
    this.upperPoint = _upperPoint;
    this.lowerPoint = _lowerPoint;
    this.center = _center || null;
    this.firstQuad = null;
    this.secondQuad = null;
    this.thirdQuad = null;
    this.fourthQuad = null;
}

QuadTree.prototype = {
    isLeaf: function isLeaf() {
        return ((this.upperPoint.X + this.lowerPoint.X)/2 !== this.center.X &&
                (this.upperPoint.Y + this.lowerPoint.Y)/2 !== this.center.Y);
    },

    isEmpty: function isEmpty() {
        return (this.center === null);
    },

    check: function check(point) {
        // Check which quadrant does the given point belong to
        if (this.isLeaf() || this.isEmpty()) {
            return null;
        }

        // Now check the four quadrants
    },

    insert: function insert(point) {
        // If the current node is empty, make this the point
        if (this.isEmpty()) {
            this.center = point;
        }

        // If the node is a leaf node, we split
        if (this.isLeaf()) {

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

            // Make a copy of the current point
            var currentPoint = this.center;

            // Assign a new center
            this.center = centerPoint;

            // Insert the currentPoint and obtained node into the correct quadrant
        }
    }
};

// Export all objects
exports.Point = Point;
exports.QuadTree = QuadTree;
