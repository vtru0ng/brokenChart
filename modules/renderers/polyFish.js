/**
 * Created by vutruong on 6/4/16.
 */

import * as d3  from '../../node_modules/d3'
import {Pixels} from '../pixels';
import {RendererBase} from './rendererBase';
import {BrokenChart} from '../brokenChart';


class PolyFish extends RendererBase {
    constructor(controller) {
        super();
        this.controller = controller;
        this.resolve = () => {};
        this.pixels = new Pixels();
    }

    run() {

        let excecutor = (resolve, reject) => {
            Promise.all([this.pixels.initCache(),  this.pixels.loadImage('images/blueFish.jpeg')])
                .then(() => {
                    return this.pixels.generate({x:0, y:0, size: 2, w:552, h:394});
                })
                .then((data) => {
                        this._render(data);
                        resolve();
                    },
                    (e) => reject(e));
        };

        return new Promise(excecutor);
    }

    _render(data) {

        // Prepare data for the Voronoi Link effect.
        var rectCenter = {x: data.x + ((data.gridSize.w/2)), y: data.y + ((data.gridSize.h/2))};

        let randomX = d3.randomNormal(rectCenter.x, 80),
            randomY = d3.randomNormal(rectCenter.y, 50),
            cell,
            cells = [],
            size = data.size,
            i = 0;

        for(i=0; i<3000; ++i) {
            let x = randomX(),
                y = randomY();

            // Map the random coordinates to the pixel grid.
            let rowIndex = BrokenChart.getGridRowIndex(y, size, data.grid.length),
                colIndex = BrokenChart.getGridColIndex(x, size, data.grid[0].length);
            cell = data.grid[rowIndex][colIndex];
            cells.push(cell);
        }

        this.controller.svg
            .attr('width', data.gridSize.w)
            .attr('height', data.gridSize.h);


        this._layer1(cells);
        this._layer3(data);
        this._layer2(cells);
    }

    // Voronoi effect.
    _layer1(cells) {
        // D3 Voronoi layer
        let lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; });

        let colors = d3.schemeCategory20b;
        let trianglevoronoi =  d3.voronoi()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; });

        let triangleData = trianglevoronoi.triangles(cells);

        let triangles = this.controller.svg.append('g')
            .attr('class', 'renderer-group')
            .append('g')
            .selectAll('path');

        triangles = triangles.data(triangleData);

        triangles.enter()
            .append('path')
            .attr('d', function(d) {

                return lineFunction([
                    {x: d[0].x, y: d[0].y},
                    {x: d[1].x, y: d[1].y},
                    {x: d[2].x, y: d[2].y}
                ]);

            })
            .attr('fill', function(d) {
                return d3.rgb(d[1].imageData.data[0], d[1].imageData.data[1], d[1].imageData.data[2]);
            }).attr('stroke-width',function(d) {
                return 1 })
            .attr('stroke',function(d) {
                return colors[ Math.min(Math.round(Math.random() * 20), 19)];
            });
    }

    // Dot effect.
    _layer2(cells) {

        let svg = this.controller.svg;

        let group = svg.append('g')
            .attr('class', 'renderer-group');

        group.selectAll('circle')
            .data(cells)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('r', function(d) {
                return 1;
            })
            .attr('cx', function(d) {
                return d.x;
            })
            .attr('cy', function(d) {
                return d.y;
            })
            .style('fill', function(d) {
                return d3.rgb(d.imageData.data[0], d.imageData.data[1], d.imageData.data[2]);

            });
    }

    // Add more details.
    _layer3(data) {
        let rect = {width: 200, height: 130, x: 60, y: 130};
        let subGrid = Pixels.generateSubGrid({width:rect.width, height:rect.height, x:rect.x, y:rect.y}, data),
            svg = this.controller.svg;

        svg.append('g')
            .attr('class', 'renderer-group symbols')
            .append('g')
            .selectAll('path')
            .data(subGrid.cells)
            .enter()
            .append('path')
            .attr("transform", function(d) {
                let x =   d.x + (d.size/2),
                    y = d.y + (d.size/2);
                return"translate(" + x + ", " + y + ")"
            })
            .style('fill-opacity',function(d) {
                return 1 - ((d.x - rect.x) / rect.width);
            })
            .style('fill',function(d) {
                return d3.rgb(d.imageData.data[0], d.imageData.data[1], d.imageData.data[2])})
            .attr('d', d3.symbol()
                .size(function(d) {
                    return 4;
                })
                .type(function(d) {
                    return d3.symbolDiamond
                })
            );
    }

    static size() {
        return {width: 500, height: 600};
    }
}

export {PolyFish}
