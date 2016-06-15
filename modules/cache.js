/**
 * Created by vutruong on 6/2/16.
 * Cache an image grid using HTML5 File System.
 */
import Filer from './libs/filer/filer';
import _ from 'underscore';
const CACHE_DIRECTORY = 'jsons';
class Cache {
	constructor() {
		this.filer = new Filer();

		this.initiated = false;
	}

	onError(e) {
		console.log('Error ' + e.name);
	}

	// Initialize the FS and create a temporary directory called 'jsons'
	init() {
		 if(this.initiated) {
			return Promise.resolve(this.dirEntry);
	     }

		let executor = (resolve, reject) => {
			this.filer.init({persistent: false, size: 1024 * 1024},
				(fs) => {
					this.createDirectory().then(
						(dirEntry) => {
							this.initiated = true;
							this.dirEntry = dirEntry;
							resolve(dirEntry);
						}
					);
				},(e) => {
					this.onError(e);
					reject(e.name)
				});
		};

		return new Promise(executor);
	}

	// Remove the temporary 'jsons' directory in the FS.
	removeDirectory() {

		let executor = (resolve, reject) => {
			this.readDirectory().then(
				(data) => {

					// Remove.
					let path = '/' + CACHE_DIRECTORY;
					let fsURL = this.filer.pathToFilesystemURL(path);
					this.filer.rm(fsURL,
						() => resolve()
						,(e) => {
							this.onError(e);
							reject(e.name);
						});
				}
			);
		};
		return new Promise(executor);
	}

	readDirectory() {
		let executor = (resolve, reject) => {
			this.filer.ls(CACHE_DIRECTORY,
				(entries) => resolve(entries),
				(e) => {
					this.onError(e);
                    reject(e.name);
				});
		};
		return new Promise(executor);
	}

	createDirectory() {
		let executor = (resolve, reject) => {
			this.filer.mkdir(CACHE_DIRECTORY, false,
				(dirEntry) => resolve(dirEntry),
				(e) => {
					this.onError(e);
					reject(e.name);
				});
		};
		return new Promise(executor);
	}

    parseJSON(fileEntry) {
        let executor = (resolve, reject) => {

            this.filer.open(fileEntry,  (file) => {

                // Use FileReader to read file.
                let reader = new FileReader();
                reader.onload = (e) => {
                    let grid = JSON.parse(e.target. result);
                    resolve(grid);
                };

                reader.readAsText(file);

            }, (e) => {
                this.onError(e);
                reject(e);

            });
        };

        return new Promise(executor);
    }

	findFile(fileName) {
        fileName =  fileName + '.json';
        let executor = (resolve, reject) => {
            this.readDirectory().then(
                (entries) => {
                    let foundFileEntry = _.findWhere(entries, {name: fileName});
                    if(foundFileEntry) {
                        this.parseJSON(foundFileEntry).then((data) => resolve(data));
                    } else {
                        reject('File not found.');
                    }
                },
                (e) => {
                    this.onError(e);
                    reject(e);
                }
            );
        };

        return new Promise(executor);
	}

	writeFile(object, cellSize) {
		let json = JSON.stringify(object),
            name = Cache.generateNameByCellSize(cellSize);

		this.filer.write('/jsons/' + name + '.json', {data: json , type: 'text/json'},
			(fileEntry, fileWriter) =>  console.log('Save file ' + name),
			this.onError
		);
	}

	static generateNameByCellSize(size) {
		 return 'grid_' + size;
	}
}

export {Cache}
