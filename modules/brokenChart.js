/**
 * Created by vutruong on 6/2/16.
 * Main controller.
 */

import * as d3  from '../node_modules/d3'
import _ from 'underscore'

class BrokenChart {

    constructor(options) {
        this.options = _.extend({width: 600, height: 400}, options);
        this.svg = d3.select('.svg-container').append('svg')
            .attr('width', this.options.width)
            .attr('height', this.options.height);
    }

    render(renderers) {
        return new Promise((resolve, reject) => {
            Promise.all(renderers).then(
                (data) => {
                    resolve();
                },
                (e) => console.log(e))
        })
    }

    // Helper methods.
    static getGridRowIndex(y, cellSize, length) {
        var row =  Math.abs(Math.ceil(y/cellSize));
        if(row >= length) {
            row =  length -1;
        }
        return row;
    };

    static getGridColIndex(x, cellSize, length) {
        var col = Math.abs(Math.ceil(x/cellSize));
        if(col >= length) {
            col = length - 1;
        }
        return col;
    };

    static isPointInRect(point,rect) {
        return (point.x > rect.x && point.x < (rect.x + rect.width) && point.y > rect.y && point.y < (rect.y + rect.height));

    };

    static getDistance(x1,x2,y1,y2) {
        return Math.sqrt( (x2-=x1)*x2 + (y2-=y1)*y2 );
    };

}

export {BrokenChart};
