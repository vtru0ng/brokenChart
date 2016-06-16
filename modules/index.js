/**
 * Created by vutruong on 6/2/16.
 */

import $ from 'jquery';
import {BrokenChart} from './brokenChart';
import {PolyFish} from './renderers/polyFish'
import {Cache} from './cache';

$(document).ready(function() {

    let $render = $('.render'),
        $clear = $('.clear'),
        $svgContainer = $('.svg-container'),
        $loader = $('.loader');

     $loader.css('display', 'none');

    $clear.on('click', function () {
        let cache = new Cache();
        cache.init().then(
            () => {return cache.removeDirectory()}
        )
        .then(
            () => { alert('Cache removed!'); }
        );
    });
    
    $render.on('click', function () {
        $loader.css('display', 'block');
        $svgContainer.empty();

        let controller = new BrokenChart(PolyFish.size());
        let renderer = new PolyFish(controller);

        controller.render([renderer.run()]).then(() => {
            $loader.css('display', 'none');
            $clear.hide();
            $render.text('Refresh');
        });
    });
    
});

