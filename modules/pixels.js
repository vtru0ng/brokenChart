/**
 * Created by vutruong on 6/2/16.
 * Load an image and extract the pixel data based on a specific cell size.
 */

import _ from 'underscore';
import {Cache} from './cache';
import {BrokenChart} from './brokenChart';

class Pixels {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.cache = new Cache();
    }

    initCache() {

        let executor = (resolve, reject) => {

            this.cache.init().then(
                (data) => {resolve(this)},
                (e) => reject(e)
            );
        };

        return new Promise(executor);
    }

    // Get the pixel data from cache or rebuild from the loaded image.
    generate(options) {
        var _options = options || {};
        _options = _.extend({
            x: 0,
            y: 0,
            size: 2,
            w: this.context.canvas.width,
            h: this.context.canvas.height,
            cache: true
        }, _options);

        var reBuild = () => {
            let width = _options.w,
                height = _options.h,
                startX = _options.x,
                startY = _options.y,
                size = _options.size;

            let r = 0;

            let totalRows = Math.ceil(height / size),
                totalCols = Math.ceil(width / size),
                grid = [],
                cells = [];

            while(r < totalRows) {
                let c = 0;
                let rows = [];
                grid[r] = rows;

                while(c < totalCols) {
                    var cell = {};
                    rows[c] = cell;
                    cell.x =  startX + (c * size);
                    cell.y = startY + (r * size);
                    cell.row = r;
                    cell.size =  size;
                    cell.col = c;
                    // Extract colors
                    // var data = self.getImageData(cell.x, cell.y, self._cellSize, self._cellSize);
                    //  cell.palette = this.createPaletteFromImageData(data);
                    cell.imageData = this.context.getImageData(cell.x, cell.y, 1, 1);

                    cell.index = cells.length;
                    cells.push(cell);
                    c++;
                }

                r++
            }

            let pixelGrid = { x: startX, y: startY, gridSize: { w: width, h: height},size: size, cells:cells, grid:grid};

            // Cache the data using the FS API.
            if(_options.cache) {
                this.cache.writeFile(pixelGrid, pixelGrid.size);
            }

            return pixelGrid ;
        };

        if(!this.cache.initiated && _options.cache) {
            alert('cache is not initialized!');
            return;
        }

        let executor = (resolve, reject) => {
            if(_options.cache) {
                let fileName = Cache.generateNameByCellSize(_options.size);
                this.cache.findFile(fileName).then(
                    (grid) => {
                        resolve(grid);
                    },
                    () => {
                        console.log(fileName + '.json does not exist in cache!');
                        let grid =  reBuild();
                        resolve(grid);
                    }
                );

            } else {
                let grid = reBuild();
                resolve(grid);
            }
        };

        return new Promise(executor);
    }

    loadImage(imagePath) {
        return new Promise((resolve, reject) => {
            if(!imagePath) {
                reject();
            }

            let imageObj = new Image();
            imageObj.onload = (evt) =>  {
                let el = document.createElement('canvas'),
                    context = el.getContext('2d'),
                    sourceImage = evt.target;

                el.width =  sourceImage.width;
                el.height =  sourceImage.height;

                context.drawImage(sourceImage, 0, 0,  el.width,  el.height);
                this.context = context;
                this.width = context.canvas.width;
                this.height = context.canvas.height;

                //$('.canvas-container').append(el);

                resolve(context);
            } ;
            imageObj.src = imagePath;
        } );

    }

    static generateSubGrid(rect, data) {
        let cells = data.cells;
        let subCells = _.filter(cells, (obj) => {
            let point = {x: obj.x, y: obj.y};
            return  BrokenChart.isPointInRect(point, rect);
        });

        let sortedCells = _.sortBy(subCells, (cell) => {return cell.row}),
            grids = [],
            row = sortedCells[0].row,
            rows = [];

        for(var i = 0; i < sortedCells.length; i++) {
            let cell = sortedCells[i];
            if(cell.row > row) {
                grids.push(rows);
                row = cell.row;
                rows = [];
            }

            rows.push(cell);
        }

        return {x:rect.x, y:rect.y, gridSize:{w:rect.width, h:rect.height}, size: data.size, cells:subCells, grid:grids}
    };
}

export {Pixels};