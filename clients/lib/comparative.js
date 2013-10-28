var epeek_theme = function() {
    "use strict";

    var genomeBrowsers;

    var pathToScript = scriptPath('comparative.js');

    var species_to_icon_filename = {
	'human' : "Homo_sapiens.png",
	'mouse' : "Mus_musculus.png",
    };

    // Now, gBs is an array of gBs
    var gBrowserTheme = function(gBs, div) {
	genomeBrowsers = gBs;
	var table = d3.select(div)
	    .append("table")
	    .attr("border", "1px solid gray")
	    .attr("margin", "0px")
	    .style("border-spacing", "0px");

	var caption_row = table
	    .append("tr")

	caption_row
	    .append("td")
	    .append("p")
	    .text("Species")

	var control_td = caption_row
	    .append("td")

	// The controls pane
	// TODO: The style elements should be included in a CSS file should we have a separate stylesheet for this theme
//	var control_pane = d3.select(div)
	var control_pane = control_td
	    .append("div")
	    .attr("class", "ePeek_control_pane")
	    .style("margin-left", "auto")
	    .style("margin-right", "auto")
	    .style("width", "30%");

	var left_button = control_pane
	    .append("button")
	    .on ("click", function() {
		for (var i = 0; i < gBs.length; i++) {
		    gBs[i].left(1.2);
		}});
	left_button
	    .append("img")
	    .attr("src", pathToScript + "../../themes/pics/glyphicons_216_circle_arrow_left.png");

	var zoomin_button = control_pane
	    .append("button")
	    .on("click", function() {
		for (var i = 0; i < gBs.length; i++) {
		    gBs[i].zoom(0.8);
		}
	    });
	zoomin_button
	    .append("img")
	    .attr("src", pathToScript + "../../themes/pics/glyphicons_190_circle_plus.png");

	var zoomout_button = control_pane
	    .append("button")
	    .on("click", function() {
		for (var i = 0; i < gBs.length; i++) {
		    gBs[i].zoom(1.2);
		}
	    });
	zoomout_button
	    .append("img")
	    .attr("src", pathToScript + "../../themes/pics/glyphicons_191_circle_minus.png");

	var right_button = control_pane
	    .append("button")
	    .on ("click", function() {
		for (var i = 0; i < gBs.length; i++) {
		    gBs[i].right(1.2);
		}
	    });
	right_button
	    .append("img")
	    .attr("src", pathToScript + "../../themes/pics/glyphicons_217_circle_arrow_right.png");

	var origin_button = control_pane
	    .append("button")
	    .on ("click", function() {
		for (var i = 0; i < gBs.length; i++) {
		    gBs[i].startOnOrigin();
		}
	    });
	origin_button
	    .append("img")
	    .attr("src", pathToScript + "../../themes/pics/glyphicons_242_google_maps.png");

	var setupDiv = function (i) {
	    setTimeout( function() {
		var gB = gBs[i];

		var table_row = table
		    .append("tr");

		table_row
		    .append("td")
		    .append("img")
		    .attr("id", "ePeek_species_icon_" + i)
		    .attr("src", pathToScript + "../../themes/pics/" + species_to_icon_filename[gB.species()]);

		table_row
		    .append("td")
		    .append("div")
		    .attr("id", "ePeek_comparative" + i);

		gB(document.getElementById("ePeek_comparative" + i));


		var gDiv = d3.select("#ePeek_comparative" + i + " .ePeek_groupDiv");

		// left chevron
		gDiv
		    .insert("img", ":first-child")
		    .attr("src", pathToScript + "../chevron_inactive_left.png")
		    .attr("height", 150)
		    .attr("width", 25)
		    .on("click", function(){gB.left(1.2)})
		    .on("mouseover", function(){
			d3.select(this).attr("src", pathToScript + "../chevron_active_left.png")
		    })
		    .on("mouseout", function(){
			d3.select(this).attr("src", pathToScript + "../chevron_inactive_left.png")
		    });


		// The locRow needs to give some room on the left
		d3.selectAll(".ePeek_locRow")
		    .style("margin-left", "25px");

		// right chevron
		gDiv
		    .append("img")
		    .attr("src", pathToScript + "../chevron_inactive_right.png")
		    .attr("height", 150)
		    .attr("width", 25)
		    .on("click", function(){gB.right(1.2)})
		    .on("mouseover", function(){
			d3.select(this).attr("src", pathToScript + "../chevron_active_right.png")
		    })
		    .on("mouseout", function(){
			d3.select(this).attr("src", pathToScript + "../chevron_inactive_right.png")
		    });

		gB.startOnOrigin();
	    }, i * 1500);	    
	}


	for (var i=0; i<gBs.length; i++) {
	    setupDiv(i);
	}

    };

    gBrowserTheme.species = function(new_species, pos) {
	var index = pos-1;
	genomeBrowsers[index].species(new_species);
	genomeBrowsers[index].startOnOrigin();
	d3.select("#ePeek_species_icon_" + index)
	    .attr("src", pathToScript + "../../themes/pics/" + species_to_icon_filename[new_species]);
    };

    gBrowserTheme.gene = function(new_gene) {
	for (var i=0; i<genomeBrowsers.length; i++) {
	    setTimeout( function(gB) {
		gB.gene(new_gene);
		gB.startOnOrigin();
	    }(genomeBrowsers[i]), i*1500);
	}
    };

    return gBrowserTheme;
}
